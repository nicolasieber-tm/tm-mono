// cal-booking-webhook: receives Cal.com BOOKING_CREATED / BOOKING_CANCELLED
// events and updates the matching website_leads row. Sends Telegram notification
// on successful booking. The lead_id is passed via Cal.com embed metadata from
// the browser; if missing, a new row is inserted with only the booking info.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

type CalAttendee = { email?: string; name?: string };
type CalPayload = {
  triggerEvent?: string;
  payload?: {
    startTime?: string;
    endTime?: string;
    title?: string;
    attendees?: CalAttendee[];
    organizer?: { email?: string; name?: string };
    responses?: { name?: { value?: string }; email?: { value?: string } };
    metadata?: Record<string, unknown>;
  };
};

async function verifyCalSignature(
  raw: string,
  signatureHeader: string | null,
  secret: string,
): Promise<boolean> {
  if (!signatureHeader) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return timingSafeEqual(hex, signatureHeader.trim());
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Cal.com can surface embed metadata in several fields depending on event-type
// settings. Check the likely places instead of assuming one path.
function extractLeadId(p: Record<string, any>): string | null {
  const candidates: unknown[] = [
    p?.metadata?.lead_id,
    p?.metadata?.["metadata[lead_id]"],
    p?.responses?.lead_id?.value,
    p?.responses?.lead_id,
    p?.bookingFieldsResponses?.lead_id,
    p?.userFieldsResponses?.lead_id,
    p?.additionalNotes,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && /^[0-9a-f-]{36}$/i.test(c)) return c;
  }
  return null;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function notifyTelegram(text: string): Promise<void> {
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (e) {
    console.error("telegram failed", e);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const raw = await req.text();
  const secret = Deno.env.get("CAL_WEBHOOK_SECRET");
  if (!secret) {
    console.error("CAL_WEBHOOK_SECRET missing");
    return new Response("misconfigured", { status: 500 });
  }

  const sig = req.headers.get("X-Cal-Signature-256");
  if (!(await verifyCalSignature(raw, sig, secret))) {
    console.warn("invalid signature");
    return new Response("invalid signature", { status: 401 });
  }

  let data: CalPayload;
  try {
    data = JSON.parse(raw);
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  const event = data.triggerEvent;
  const p = data.payload ?? {};
  const leadId = extractLeadId(p);
  const attendee = p.attendees?.[0];
  const bookingEmail = attendee?.email ?? p.responses?.email?.value ?? null;
  const bookingName = attendee?.name ?? p.responses?.name?.value ?? null;
  const startTime = p.startTime ?? null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return new Response("misconfigured", { status: 500 });
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  if (event === "BOOKING_CREATED") {
    if (leadId) {
      const { error } = await supabase
        .from("website_leads")
        .update({
          booking_status: "booked",
          booking_email: bookingEmail,
          booking_name: bookingName,
          booking_start_time: startTime,
          booked_at: new Date().toISOString(),
        })
        .eq("id", leadId);
      if (error) console.error("update failed", error);
    } else {
      const { error } = await supabase.from("website_leads").insert({
        booking_status: "booked",
        booking_email: bookingEmail,
        booking_name: bookingName,
        booking_start_time: startTime,
        booked_at: new Date().toISOString(),
      });
      if (error) console.error("insert (no lead_id) failed", error);
    }

    // Load the full row to include the question answers in the Telegram message.
    let row: Record<string, unknown> | null = null;
    if (leadId) {
      const { data: r } = await supabase
        .from("website_leads")
        .select("*")
        .eq("id", leadId)
        .maybeSingle();
      row = r ?? null;
    }

    const when = startTime ? new Date(startTime).toLocaleString("de-CH", {
      timeZone: "Europe/Zurich",
      dateStyle: "full",
      timeStyle: "short",
    }) : "–";

    const lines = [
      "📅 <b>Neue Termin-Buchung (Anfrage)</b>",
      "",
      `<b>Wann:</b> ${esc(when)}`,
      `<b>Name:</b> ${esc(bookingName ?? "–")}`,
      `<b>E-Mail:</b> ${esc(bookingEmail ?? "–")}`,
    ];
    if (row) {
      lines.push(
        "",
        "<b>Antworten:</b>",
        `• Firma: ${esc(String(row.company_name ?? "–"))}`,
        `• Mitarbeitende: ${esc(String(row.employees ?? "–"))}`,
        `• Zeiterfassung heute: ${esc(String(row.time_tracking ?? "–"))}`,
        `• ERP: ${esc(String(row.erp ?? "–"))}`,
        `• Pain Points: ${esc(Array.isArray(row.pain_points) ? (row.pain_points as string[]).join(", ") : "–")}`,
        `• Zeitrahmen: ${esc(String(row.timeline ?? "–"))}`,
      );
    } else {
      lines.push("", "<i>(keine Anfrage-Antworten verknüpft)</i>");
    }

    await notifyTelegram(lines.join("\n"));
  } else if (event === "BOOKING_CANCELLED" && leadId) {
    const { error } = await supabase
      .from("website_leads")
      .update({ booking_status: "cancelled" })
      .eq("id", leadId);
    if (error) console.error("cancel update failed", error);
  }

  return new Response("ok", { status: 200 });
});
