// send-video-email: schickt dem Lead den Link zum Video auf
// start.oneclick-office.ch/video via Resend.
//
// Aufruf: DB-Trigger trg_send_video_email (pg_net) bei INSERT in public.leads –
// aber NUR für Leads der Kampagnen-Landingpage (source = 'lp-start'). Die
// übrigen Funnel (Demo-Seite) haben ihre eigenen Mails bzw. keine.
//
// Warum überhaupt eine Mail, wo das Video doch direkt nach dem Eintrag läuft:
// Viele schauen es nicht zu Ende oder werden unterbrochen. Der Link im
// Postfach holt sie zurück — und die Zusage steht so auch im Opt-in-Formular.
//
// Schutz: läuft ohne JWT (verify_jwt=false) und prüft stattdessen ein
// Shared-Secret im Header (x-webhook-secret) – identisch zu notify-lead und
// send-demo-email.
//
// Design 1:1 nach send-demo-email (die wiederum der Terminbestätigung folgt):
// Table-Layout + Inline-Styles (Outlook/Gmail/Apple-Mail-kompatibel), Akzent
// #2563eb, neutrale Grau-Palette, Du-Ansprache, Schweizer Rechtschreibung.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Gleiche Fallback-Kette wie send-demo-email. Im Projekt liegt der Schlüssel
// aktuell als ONECLICK-OFFICE_RESEND_API_KEY (mit Bindestrich) vor.
// RESEND_API_KEY (trendingmedia) nur als Notnagel.
const RESEND_API_KEY =
  Deno.env.get("DEMO_RESEND_API_KEY") ??
  Deno.env.get("ONECLICK_OFFICE_RESEND_API_KEY") ??
  Deno.env.get("ONECLICK-OFFICE_RESEND_API_KEY") ??
  Deno.env.get("ONECLICKOFFICE_RESEND_API_KEY") ??
  Deno.env.get("RESEND_API_KEY") ??
  "";

// Absender: Default ist die bereits erprobte Adresse der Demo-Mail. Über
// VIDEO_MAIL_FROM lässt sich das auf z. B. video@oneclick-office.ch umstellen –
// die Domain ist bei Resend verifiziert, jede Adresse darunter funktioniert.
const MAIL_FROM =
  Deno.env.get("VIDEO_MAIL_FROM") ??
  Deno.env.get("DEMO_MAIL_FROM") ??
  "OneClick Office <demo@oneclick-office.ch>";
const MAIL_REPLY_TO =
  Deno.env.get("VIDEO_MAIL_REPLY_TO") ??
  Deno.env.get("DEMO_MAIL_REPLY_TO") ??
  "demo@oneclick-office.ch";

const SITE_URL = Deno.env.get("VIDEO_SITE_URL") ?? "https://start.oneclick-office.ch";
const VIDEO_LINK = Deno.env.get("VIDEO_LINK") ?? `${SITE_URL}/video`;

// Logo als PNG (WebP unterstützen viele Mail-Clients nicht) von einer Datei,
// die auf der neuen Domain sicher existiert.
const LOGO_URL =
  Deno.env.get("VIDEO_MAIL_LOGO_URL") ?? `${SITE_URL}/android-chrome-192x192.png`;

// Shared-Secret: eigenes VIDEO_EMAIL_SECRET bevorzugt, sonst das bestehende
// LEAD_NOTIFY_SECRET (schützt bereits notify-lead und send-demo-email).
const WEBHOOK_SECRET =
  Deno.env.get("VIDEO_EMAIL_SECRET") ??
  Deno.env.get("DEMO_EMAIL_SECRET") ??
  Deno.env.get("LEAD_NOTIFY_SECRET") ??
  "";

const ACCENT = "#2563eb";
const BRAND = "OneClick Office";

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

/** HTML-escapen – der Lead-Name kommt aus User-Eingabe (Injection-Schutz). */
const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Nur den Vornamen für eine persönliche, lockere Anrede. */
const firstName = (full: string): string => full.trim().split(/\s+/)[0] ?? "";

/** Basis-E-Mail-Adressvalidierung, bevor wir Resend bemühen. */
const isEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function renderHtml(name: string): string {
  const hi = name ? `, ${escapeHtml(name)}` : "";
  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${BRAND} – dein Video</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
             style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;
                    box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <tr><td style="padding:28px 32px 8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="padding-right:10px;vertical-align:middle;">
              <img src="${LOGO_URL}" alt="${BRAND}" width="28" height="28"
                   style="width:28px;height:28px;display:block;border:0;border-radius:6px;">
            </td>
            <td style="vertical-align:middle;font-family:Helvetica,Arial,sans-serif;
                 font-size:18px;font-weight:700;color:#111827;letter-spacing:-.01em;">
              OneClick<span style="color:${ACCENT};">&nbsp;Office</span>
            </td>
          </tr></table>
        </td></tr>

        <tr><td style="padding:12px 32px 4px;font-family:Helvetica,Arial,sans-serif;">
          <p style="margin:0;font-size:13px;font-weight:600;color:${ACCENT};letter-spacing:.04em;
                    text-transform:uppercase;">Dein Video</p>
          <h1 style="margin:6px 0 0;font-size:22px;line-height:1.3;color:#111827;">
            Hier ist dein Video${hi}!</h1>
          <p style="margin:8px 0 0;font-size:15px;color:#4b5563;line-height:1.5;">
            Du kannst es jederzeit über diesen Link wieder öffnen – falls du unterbrochen wurdest
            oder es in Ruhe zu Ende schauen willst.</p>
        </td></tr>

        <tr><td style="padding:20px 32px 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="background:#f9fafb;border-radius:10px;">
            <tr><td style="padding:18px 20px;font-family:Helvetica,Arial,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="padding:2px 0;font-size:17px;font-weight:600;color:#111827;">
                  Adminaufwand auf wenige Stunden reduzieren</td></tr>
                <tr><td style="padding:2px 0;font-size:14px;color:#6b7280;">
                  6:33 Minuten · kostenlos</td></tr>
                <tr><td style="padding:2px 0;font-size:14px;color:#6b7280;">
                  Für Coaches, Berater und Dienstleister</td></tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:8px 32px 4px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr><td align="center" bgcolor="${ACCENT}" style="border-radius:8px;">
              <a href="${VIDEO_LINK}" target="_blank"
                 style="display:inline-block;padding:14px 28px;font-family:Helvetica,Arial,sans-serif;
                        font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                Video jetzt ansehen
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding:6px 32px 0;font-family:Helvetica,Arial,sans-serif;
             font-size:12px;color:#6b7280;word-break:break-all;">${VIDEO_LINK}</td></tr>

        <tr><td style="padding:24px 32px 8px;font-family:Helvetica,Arial,sans-serif;font-size:14px;
             color:#4b5563;line-height:1.6;">
          Im Video geht es darum, welche Schritte im Monat am meisten Zeit kosten und wie sich
          der Aufwand von ganzen Arbeitstagen auf wenige Stunden bringen lässt.<br><br>
          Wenn du danach wissen willst, was das für deinen Betrieb konkret heisst: Unter dem Video
          kannst du direkt ein kostenloses Gespräch buchen.<br><br>
          Bis bald,<br><strong>OneClick Office Team</strong>
        </td></tr>
        <tr><td style="padding:20px 32px 28px;border-top:1px solid #eef0f2;
             font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#9ca3af;line-height:1.5;">
          © 2026 ${BRAND} · <a href="${SITE_URL}" style="color:#9ca3af;">start.oneclick-office.ch</a><br>
          Du erhältst diese E-Mail, weil du auf unserer Website das Video angefordert hast.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// Reine Text-Variante (Deliverability + Text-only-Clients).
function renderText(name: string): string {
  return (
    `Hier ist dein Video${name ? ", " + name : ""}!\n\n` +
    `Du kannst es jederzeit über diesen Link wieder öffnen:\n\n` +
    `${VIDEO_LINK}\n\n` +
    `Adminaufwand auf wenige Stunden reduzieren – 6:33 Minuten, kostenlos.\n\n` +
    `Im Video geht es darum, welche Schritte im Monat am meisten Zeit kosten und wie sich ` +
    `der Aufwand von ganzen Arbeitstagen auf wenige Stunden bringen lässt. Unter dem Video ` +
    `kannst du direkt ein kostenloses Gespräch buchen.\n\n` +
    `Bis bald,\nOneClick Office Team`
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "method not allowed" });

  const provided = req.headers.get("x-webhook-secret") ?? "";
  if (!WEBHOOK_SECRET || provided !== WEBHOOK_SECRET) {
    return json(401, { error: "unauthorized" });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // leerer/ungültiger Body -> als leeres Objekt behandeln
  }

  // Health-/Diagnose-Check (secret-geschützt, leakt keine Keys): zeigt, ob der
  // Resend-Key aufgelöst wird und mit welchem Absender/Link gesendet würde.
  if (body.diag === true) {
    return json(200, {
      keyResolved: RESEND_API_KEY ? "yes" : "no",
      mailFrom: MAIL_FROM,
      videoLink: VIDEO_LINK,
      logoUrl: LOGO_URL,
    });
  }

  if (!RESEND_API_KEY) return json(500, { error: "RESEND_API_KEY not configured" });

  // pg_net-Trigger sendet { record: {...} }; Fallback auf direktes Lead-Objekt.
  const lead = ((body.record ?? body.lead ?? body) ?? {}) as Record<string, unknown>;
  const email = String(lead.email ?? "").trim();
  const name = firstName(String(lead.name ?? ""));

  if (!isEmail(email)) return json(422, { error: "no valid recipient email" });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: MAIL_FROM,
      to: [email],
      reply_to: MAIL_REPLY_TO,
      subject: "Dein Video: Adminaufwand auf wenige Stunden reduzieren",
      html: renderHtml(name),
      text: renderText(name),
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("resend video mail failed:", res.status, detail);
    return json(502, { error: `resend ${res.status}`, detail });
  }

  return json(200, { ok: true, sentTo: email });
});
