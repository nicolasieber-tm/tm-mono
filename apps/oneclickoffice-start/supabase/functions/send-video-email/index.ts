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
// Antworten sollen NICHT an die Absenderadresse gehen: demo@oneclick-office.ch
// ist faktisch ein Postfach ohne Betreuung. Wer auf diese Mail antwortet, landet
// im allgemeinen Postfach, das auch wirklich gelesen wird.
const MAIL_REPLY_TO =
  Deno.env.get("VIDEO_MAIL_REPLY_TO") ?? "info@trendingmedia.ch";

const SITE_URL = Deno.env.get("VIDEO_SITE_URL") ?? "https://start.oneclick-office.ch";
const VIDEO_LINK = Deno.env.get("VIDEO_LINK") ?? `${SITE_URL}/video`;

/**
 * Der Link bekommt die Ereigniskennung des Leads mit (`fu`).
 *
 * Grund: Wer später über diese Mail zurückkommt, startet im Browser eine neue
 * Sitzung. Ohne Kennung wäre sein Videofortschritt keinem Lead zuzuordnen — die
 * Folgestrecke hielte ihn weiter für jemanden, der das Video nie geöffnet hat,
 * und schickte ihm genau das als Erinnerung. Die Kennung ist eine Zufalls-UUID
 * ohne Personenbezug; die Video-Seite schreibt sie nur ins eigene Tracking.
 */
const videoLinkFuer = (metaEventId: string): string => {
  if (!metaEventId) return VIDEO_LINK;
  const trenner = VIDEO_LINK.includes("?") ? "&" : "?";
  return `${VIDEO_LINK}${trenner}fu=${encodeURIComponent(metaEventId)}`;
};

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

// Telegram-Kanal des Teams — dieselben Variablen, die notify-lead schon nutzt.
const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID") ?? "";

/**
 * Meldet Störungen an das Team.
 *
 * Warum: Der Aufruf kommt per pg_net aus einem DB-Trigger — fire-and-forget.
 * Die Antwort dieser Funktion liest niemand. Schlug der Versand fehl, stand der
 * Lead trotzdem in der Datenbank, das Telegram zum Lead kam an, und das Team
 * hielt alles für erledigt. Ein falsch gesetztes Secret oder ein fehlender
 * API-Schlüssel legte den Mailversand für ALLE Leads still, ohne dass es
 * auffiel — sichtbar erst, wenn jemand die Function-Logs öffnete.
 *
 * Darf selbst nie etwas umwerfen: Fehler werden geschluckt.
 */
let dauerfehlerGemeldet = false;

async function meldeStoerung(text: string, nurEinmal = false) {
  if (nurEinmal) {
    // Ein falsch gesetztes Secret oder ein fehlender Schlüssel betrifft jeden
    // Aufruf. Ohne diese Bremse liefe das Team in eine Nachrichtenflut.
    if (dauerfehlerGemeldet) return;
    dauerfehlerGemeldet = true;
  }
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error("Stoerung, aber Telegram nicht konfiguriert:", text);
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Kein parse_mode: beliebige Zeichen in Fehlermeldungen koennen die
      // Nachricht dann nicht zerbrechen.
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `⚠️ Video-Mail (lp-start)\n\n${text}`,
      }),
    });
  } catch (e) {
    console.error("Telegram-Meldung fehlgeschlagen:", e);
  }
}

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

function renderHtml(name: string, link: string): string {
  const hi = name ? `, ${escapeHtml(name)}` : "";
  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${BRAND}: dein Video</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;">
  <!-- Vorschauzeile: erscheint im Posteingang neben dem Betreff, nicht in der
       geöffneten Mail. Ohne sie zeigt Gmail den ersten Text aus dem Rumpf —
       hier dreimal hintereinander den Markennamen, direkt neben dem Absender,
       der auch schon so heisst.
       Bewusst OHNE Zeitangabe: An dieser Stelle entscheidet jemand, ob er
       überhaupt öffnet, und eine Minutenzahl liest sich dort als Aufwand.
       Stattdessen der Beleg, der in dieser Mail sonst gar nicht vorkommt. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Der Ablauf, mit dem aus rund 1.5 Tagen Administration im Monat wenige Stunden wurden.</div>
  <!-- Füllzeichen, damit der Client nicht doch noch Text aus dem Rumpf nachzieht. -->
  <div style="display:none;max-height:0;overflow:hidden;">&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
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
            Du kannst es jederzeit über diesen Link wieder öffnen, falls du unterbrochen wurdest
            oder es in Ruhe zu Ende schauen willst.</p>
        </td></tr>

        <tr><td style="padding:20px 32px 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="background:#f9fafb;border-radius:10px;">
            <tr><td style="padding:18px 20px;font-family:Helvetica,Arial,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="padding:2px 0;font-size:17px;font-weight:600;color:#111827;">
                  Adminaufwand von Tagen auf Stunden reduzieren</td></tr>
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
              <a href="${link}" target="_blank"
                 style="display:inline-block;padding:14px 28px;font-family:Helvetica,Arial,sans-serif;
                        font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                Video jetzt ansehen
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding:6px 32px 0;font-family:Helvetica,Arial,sans-serif;
             font-size:12px;color:#6b7280;word-break:break-all;">${link}</td></tr>

        <tr><td style="padding:24px 32px 8px;font-family:Helvetica,Arial,sans-serif;font-size:14px;
             color:#4b5563;line-height:1.6;">
          Im Video geht es darum, welche Schritte im Monat am meisten Zeit kosten und wie sich
          der Aufwand von Tagen auf Stunden bringen lässt.<br><br>
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
function renderText(name: string, link: string): string {
  return (
    `Hier ist dein Video${name ? ", " + name : ""}!\n\n` +
    `Du kannst es jederzeit über diesen Link wieder öffnen:\n\n` +
    `${link}\n\n` +
    `Adminaufwand von Tagen auf Stunden reduzieren. 6:33 Minuten, kostenlos.\n\n` +
    `Im Video geht es darum, welche Schritte im Monat am meisten Zeit kosten und wie sich ` +
    `der Aufwand von Tagen auf Stunden bringen lässt. Unter dem Video ` +
    `kannst du direkt ein kostenloses Gespräch buchen.\n\n` +
    `Bis bald,\nOneClick Office Team`
  );
}

/**
 * Auffangnetz für alles, was nicht vorhergesehen ist.
 *
 * Die vorbereiteten Fehlerpfade unten decken ab, was schiefgehen KANN — ein
 * abgelehnter Versand, ein fehlender Schlüssel. Sie greifen aber nicht, wenn
 * der Code selbst stolpert: Dann bricht die Anfrage mit einem nackten
 * "Internal Server Error" ab, die Meldung ans Team bleibt aus, und der Lead
 * wartet auf eine Mail, von der niemand weiss, dass sie fehlt. Genau so ist am
 * 21.08.2026 ein Tippfehler in einer Vorlage vier Stunden unbemerkt geblieben.
 */
serve(async (req) => {
  try {
    return await bearbeite(req);
  } catch (e) {
    const text = e instanceof Error ? `${e.message}\n${e.stack ?? ""}` : String(e);
    console.error("send-video-email abgestuerzt:", text);
    await meldeStoerung(
      `Unerwarteter Fehler - es ging KEINE Video-Mail raus:\n${text.slice(0, 500)}`,
      true,
    );
    return json(500, { error: "interner Fehler", detail: text.slice(0, 300) });
  }
});

async function bearbeite(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "method not allowed" });

  const provided = req.headers.get("x-webhook-secret") ?? "";
  if (!WEBHOOK_SECRET) {
    // Kein Secret hinterlegt: Dann kommt KEINE Video-Mail mehr durch — das ist
    // eine Fehlkonfiguration, kein Angriff, und muss ans Team.
    await meldeStoerung(
      "Kein Shared-Secret gesetzt (VIDEO_EMAIL_SECRET / DEMO_EMAIL_SECRET / " +
        "LEAD_NOTIFY_SECRET). Es geht derzeit KEINE Video-Mail raus.",
      true,
    );
    return json(401, { error: "unauthorized" });
  }
  if (provided !== WEBHOOK_SECRET) {
    // Falsches Secret: Kann auch von aussen kommen — nur einmal pro Instanz
    // melden, damit niemand das Team zuschütten kann.
    await meldeStoerung(
      "Aufruf mit falschem Shared-Secret abgewiesen. Wenn gerade Leads eintreffen, " +
        "stimmt das Secret im DB-Trigger nicht mehr mit der Function überein.",
      true,
    );
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

  if (!RESEND_API_KEY) {
    await meldeStoerung(
      "Kein Resend-API-Schlüssel hinterlegt. Es geht derzeit KEINE Video-Mail raus.",
      true,
    );
    return json(500, { error: "RESEND_API_KEY not configured" });
  }

  // pg_net-Trigger sendet { record: {...} }; Fallback auf direktes Lead-Objekt.
  const lead = ((body.record ?? body.lead ?? body) ?? {}) as Record<string, unknown>;
  const email = String(lead.email ?? "").trim();
  const name = firstName(String(lead.name ?? ""));

  if (!isEmail(email)) return json(422, { error: "no valid recipient email" });

  // Kennung mitgeben, damit eine spätere Rückkehr über diese Mail dem Lead
  // zugeordnet werden kann (siehe videoLinkFuer).
  const link = videoLinkFuer(String(lead.meta_event_id ?? ""));

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
      subject: "Dein Video: Adminaufwand von Tagen auf Stunden reduzieren",
      html: renderHtml(name, link),
      text: renderText(name, link),
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("resend video mail failed:", res.status, detail);
    await meldeStoerung(
      `Versand an ${email} fehlgeschlagen (Resend ${res.status}).\n${detail.slice(0, 400)}\n\n` +
        "Der Lead ist in der Datenbank, hat aber keinen Video-Link bekommen.",
    );
    return json(502, { error: `resend ${res.status}`, detail });
  }

  return json(200, { ok: true, sentTo: email });
}
