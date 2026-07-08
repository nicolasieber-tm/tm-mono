// send-demo-email: schickt dem Interessenten automatisch den Demo-Zugang zur
// Live-Demo (demo.oneclick-office.ch) via Resend.
//
// Aufruf: DB-Trigger trg_send_demo_email (pg_net) bei INSERT in public.leads –
// aber NUR für Mobile-Optin-Leads (source = 'landingpage-demo-mobile'). Der
// Desktop-Funnel bucht direkt ein Beratungsgespräch und bekommt keine Demo-Mail.
//
// Schutz: läuft ohne JWT (verify_jwt=false) und prüft stattdessen ein
// Shared-Secret im Header (x-webhook-secret) – identisch zum Muster von notify-lead.
//
// WICHTIG: oneclick-office.ch liegt in einem EIGENEN Resend-Account (getrennt von
// trendingmedia.ch). Darum eigener Secret-Name – der bestehende RESEND_API_KEY
// (trendingmedia, Vertrags-Mails) darf NICHT überschrieben werden.
//
// Design 1:1 nach der Terminbestätigungs-Vorlage: Table-Layout + Inline-Styles
// (Outlook/Gmail/Apple-Mail-kompatibel), Akzent #2563eb, neutrale Grau-Palette,
// Du-Ansprache, Schweizer Rechtschreibung.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Bevorzugt den dedizierten OneClick-Resend-Key (mehrere Namensvarianten, je
// nach Secret-Name; Bindestriche in Env-Namen sind unzuverlässig -> Unterstriche
// bevorzugen). RESEND_API_KEY (trendingmedia) nur als Notnagel.
const RESEND_API_KEY =
  Deno.env.get("DEMO_RESEND_API_KEY") ??
  Deno.env.get("ONECLICK_OFFICE_RESEND_API_KEY") ??
  Deno.env.get("ONECLICK-OFFICE_RESEND_API_KEY") ??
  Deno.env.get("ONECLICKOFFICE_RESEND_API_KEY") ??
  Deno.env.get("RESEND_API_KEY") ??
  "";
// Absender/Reply-To/Logo über Secrets überschreibbar; Defaults passen zur
// verifizierten Domain oneclick-office.ch.
const MAIL_FROM = Deno.env.get("DEMO_MAIL_FROM") ?? "OneClick Office <demo@oneclick-office.ch>";
const MAIL_REPLY_TO = Deno.env.get("DEMO_MAIL_REPLY_TO") ?? "demo@oneclick-office.ch";
const DEMO_URL = Deno.env.get("DEMO_URL") ?? "https://demo.oneclick-office.ch";
const LOGO_URL =
  Deno.env.get("DEMO_MAIL_LOGO_URL") ??
  "https://demo.oneclick-office.ch/oneclick-office-icon.png";
// Shared-Secret: eigenes DEMO_EMAIL_SECRET bevorzugt, sonst das bestehende
// LEAD_NOTIFY_SECRET (schützt bereits notify-lead).
const WEBHOOK_SECRET =
  Deno.env.get("DEMO_EMAIL_SECRET") ?? Deno.env.get("LEAD_NOTIFY_SECRET") ?? "";

const ACCENT = "#2563eb"; // Vorlage-Akzent (blue), guter Weiss-Kontrast auf Buttons
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

// HTML-Vorlage 1:1 im Stil der Terminbestätigung: grauer Hintergrund, weisse Card,
// Logo-Header, Eyebrow + H1, graue Info-Box, blauer CTA, Signatur, Footer.
function renderHtml(name: string): string {
  const hi = name ? `, ${escapeHtml(name)}` : "";
  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${BRAND} – Demo-Zugang</title></head>
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
                    text-transform:uppercase;">Dein Demo-Zugang</p>
          <h1 style="margin:6px 0 0;font-size:22px;line-height:1.3;color:#111827;">
            Vielen Dank${hi}!</h1>
          <p style="margin:8px 0 0;font-size:15px;color:#4b5563;line-height:1.5;">
            Danke für dein Interesse an ${BRAND}. Deine Live-Demo steht bereit, hier sind die Details:</p>
        </td></tr>

        <tr><td style="padding:20px 32px 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="background:#f9fafb;border-radius:10px;">
            <tr><td style="padding:18px 20px;font-family:Helvetica,Arial,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="padding:2px 0;font-size:17px;font-weight:600;color:#111827;">
                  OneClick Office – Live-Demo</td></tr>
                <tr><td style="padding:2px 0;font-size:14px;color:#6b7280;">
                  Kostenlos · ohne Anmeldung</td></tr>
                <tr><td style="padding:2px 0;font-size:14px;color:#6b7280;">
                  Für den vollen Einblick am besten am Desktop öffnen</td></tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:8px 32px 4px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr><td align="center" bgcolor="${ACCENT}" style="border-radius:8px;">
              <a href="${DEMO_URL}" target="_blank"
                 style="display:inline-block;padding:14px 28px;font-family:Helvetica,Arial,sans-serif;
                        font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                Zur Live-Demo
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding:6px 32px 0;font-family:Helvetica,Arial,sans-serif;
             font-size:12px;color:#6b7280;word-break:break-all;">${DEMO_URL}</td></tr>

        <tr><td style="padding:24px 32px 8px;font-family:Helvetica,Arial,sans-serif;font-size:14px;
             color:#4b5563;line-height:1.6;">
          Klick dich in Ruhe durch, du siehst, wie aus erfassten Zeiten und Belegen mit einem Klick
          fertige Rechnungen werden.<br><br>
          Bis bald,<br><strong>OneClick Office Team</strong>
        </td></tr>
        <tr><td style="padding:20px 32px 28px;border-top:1px solid #eef0f2;
             font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#9ca3af;line-height:1.5;">
          © 2026 ${BRAND} · <a href="${DEMO_URL}" style="color:#9ca3af;">demo.oneclick-office.ch</a><br>
          Du erhältst diese E-Mail, weil du auf unserer Website den Demo-Zugang angefordert hast.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// Reine Text-Variante (Deliverability + Text-only-Clients).
function renderText(name: string): string {
  return (
    `Vielen Dank${name ? ", " + name : ""}!\n\n` +
    `Danke für dein Interesse an ${BRAND}. Deine Live-Demo steht bereit, ` +
    `kostenlos und ohne Anmeldung:\n\n` +
    `${DEMO_URL}\n\n` +
    `Für den vollen Einblick öffnest du sie am besten am Desktop. Du siehst, wie aus ` +
    `erfassten Zeiten und Belegen mit einem Klick fertige Rechnungen werden.\n\n` +
    `Bis bald,\nOneClick Office Team`
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "method not allowed" });

  // Shared-Secret-Schutz.
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

  // Health-/Diagnose-Check (secret-geschützt, leakt keine Keys): zeigt, welche
  // RESEND-Env-Namen wirklich ankommen – deckt Secret-/Account-Verwechslungen auf.
  if (body.diag === true) {
    const resendEnvKeys = Object.keys(Deno.env.toObject()).filter((k) =>
      /resend/i.test(k)
    );
    return json(200, {
      resendEnvKeys,
      keyResolved: RESEND_API_KEY ? "yes" : "no",
      mailFrom: MAIL_FROM,
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
      subject: "Dein Demo-Zugang zu OneClick Office",
      html: renderHtml(name),
      text: renderText(name),
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("resend demo mail failed:", res.status, detail);
    return json(502, { error: `resend ${res.status}`, detail });
  }

  return json(200, { ok: true, sentTo: email });
});
