import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Telegram-Benachrichtigung bei neuem Lead (One Click Office).
// Wird vom DB-Trigger trg_notify_new_lead (pg_net) bei INSERT in public.leads
// aufgerufen – fuer ALLE Funnel, unabhaengig von der Quelle.
// Schutz: Die Function laeuft ohne JWT (verify_jwt=false) und prueft stattdessen
// einen Shared-Secret-Header (analog google-calendar-sync).
//
// Die Funnel liefern unterschiedliche Felder: Der Desktop-Wizard der Demo-Seite
// hat vier Qualifizierungsfragen, das Mobile-Optin und die Kampagnen-Landingpage
// haben keine. Darum werden leere Felder weggelassen, statt sie als Striche
// auszugeben – sonst besteht die halbe Nachricht aus Platzhaltern.

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID") ?? "";
const LEAD_NOTIFY_SECRET = Deno.env.get("LEAD_NOTIFY_SECRET") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

const json = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

/** Ist der Wert gesetzt und nicht leer? */
const has = (v: unknown): boolean => (v ?? "").toString().trim().length > 0;

const val = (v: unknown): string => {
  const s = (v ?? "").toString().trim();
  return s.length ? s : "—";
};

/** Quelle lesbar machen – "lp-start" sagt im Chat sonst niemandem etwas. */
const SOURCE_LABEL: Record<string, string> = {
  "lp-start": "Kampagnen-Landingpage (Video-Optin)",
  "landingpage-demo": "Demo-Seite, Desktop-Wizard",
  "landingpage-demo-mobile": "Demo-Seite, Mobile-Optin",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "method not allowed" });

  // Shared-Secret-Schutz (konstante Laenge vorausgesetzt -> einfacher Vergleich genuegt hier)
  const provided = req.headers.get("x-webhook-secret") ?? "";
  if (!LEAD_NOTIFY_SECRET || provided !== LEAD_NOTIFY_SECRET) {
    return json(401, { error: "unauthorized" });
  }

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return json(500, { error: "telegram not configured" });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // leerer/ungueltiger Body -> als leeres Objekt behandeln
  }

  // pg_net-Trigger sendet { record: {...} }; Fallback auf direktes Lead-Objekt.
  const lead = ((body.record ?? body.lead ?? body) ?? {}) as Record<string, unknown>;

  const source = (lead.source ?? "").toString().trim();

  const lines: string[] = [
    "🎯 Neuer Lead — One Click Office",
    "",
    `👤 ${val(lead.name)}`,
    `✉️ ${val(lead.email)}`,
    `📞 ${val(lead.telefon)}`,
  ];

  // Qualifizierungsfelder nur, wenn der Funnel sie ueberhaupt erhebt.
  const extras: Array<[string, unknown]> = [
    ["🏢 Klienten/Monat", lead.klienten_pro_monat],
    ["🧾 Buchhaltung", lead.buchhaltungssystem],
    ["📄 Rechnungen", lead.rechnungserstellung],
    ["🗓 Monatsabschluss", lead.zeit_monatsabschluss],
    ["💻 Aktuelles System", lead.aktuelles_system],
  ];
  const filled = extras.filter(([, v]) => has(v));
  if (filled.length > 0) {
    lines.push("");
    for (const [label, v] of filled) lines.push(`${label}: ${val(v)}`);
  }

  if (lead.rueckruf === true) {
    lines.push("");
    lines.push("🔔 Rueckruf gewuenscht");
  }

  lines.push("");
  lines.push(`🔗 Quelle: ${SOURCE_LABEL[source] ?? val(source)}`);

  const tgRes = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Kein parse_mode -> beliebige Zeichen in Lead-Daten koennen die Nachricht nicht brechen.
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: lines.join("\n") }),
    },
  );

  if (!tgRes.ok) {
    const detail = await tgRes.text();
    console.error("Telegram sendMessage failed:", tgRes.status, detail);
    return json(502, { error: "telegram failed", detail });
  }

  return json(200, { ok: true });
});
