// send-followup: die Folgestrecke zum Video-Funnel (source = 'lp-start').
//
// Warum es das gibt: Bis hierher ging genau eine Mail raus — der Video-Link,
// Sekunden nach dem Eintrag. Danach nichts mehr. Wer das Video nie öffnete, wer
// es zur Hälfte sah oder wer es zu Ende sah und trotzdem keinen Termin buchte,
// wurde nie wieder angesprochen. Genau diese Leute sind aber bereits bezahlt.
//
// Drei Stufen, je nachdem, wie weit jemand gekommen ist:
//   1  nach 24 h   Video gar nicht gestartet        -> Erinnerung
//   2  nach 3 Tagen Video begonnen, nicht beendet   -> Nachfassen
//   3  nach 5 Tagen Video zu Ende, kein Buchungs-Klick -> Einwand ausräumen
//
// Aufruf: stündlich per pg_cron (siehe migrations/20260820_followup_strecke.sql),
// geschützt über dasselbe Shared-Secret wie die übrigen Funktionen.
// Zusätzlich beantwortet die Funktion GET ?abmelden=<token> — der Abmeldelink
// aus den Mails. Sobald mehr als eine Mail rausgeht, ist der Pflicht.
//
// Ein Lead bekommt pro Lauf höchstens eine Mail. Doppelversand verhindert die
// Datenbank selbst: lead_followups hat einen Unique-Index auf (lead_id, stufe).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY =
  Deno.env.get("ONECLICK-OFFICE_RESEND_API_KEY") ??
  Deno.env.get("ONECLICK_OFFICE_RESEND_API_KEY") ??
  Deno.env.get("RESEND_API_KEY") ??
  "";

const MAIL_FROM =
  Deno.env.get("VIDEO_MAIL_FROM") ??
  Deno.env.get("DEMO_MAIL_FROM") ??
  "OneClick Office <demo@oneclick-office.ch>";

const MAIL_REPLY_TO =
  Deno.env.get("VIDEO_MAIL_REPLY_TO") ?? "info@trendingmedia.ch";

const SITE_URL = Deno.env.get("VIDEO_SITE_URL") ?? "https://start.oneclick-office.ch";
const VIDEO_LINK = Deno.env.get("VIDEO_LINK") ?? `${SITE_URL}/video`;
const LOGO_URL =
  Deno.env.get("VIDEO_MAIL_LOGO_URL") ?? `${SITE_URL}/android-chrome-192x192.png`;

const BUCHUNG_URL =
  Deno.env.get("BOOKING_URL") ??
  "https://timetracking.trendingmedia.ch/book-widget/9ac37dbb-e0fc-4ea4-89c4-3183c7d4ece4";

const WEBHOOK_SECRET =
  Deno.env.get("VIDEO_EMAIL_SECRET") ??
  Deno.env.get("DEMO_EMAIL_SECRET") ??
  Deno.env.get("LEAD_NOTIFY_SECRET") ??
  "";

// In Edge Functions von Supabase automatisch gesetzt.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID") ?? "";

const ACCENT = "#2563eb";
const BRAND = "OneClick Office";
const QUELLE = "lp-start";

/** Wie viele Leads ein Lauf höchstens anfasst — hält Laufzeit und Resend-Last klein. */
const MAX_PRO_LAUF = 40;

/**
 * Älteres rührt die Strecke nicht mehr an.
 *
 * Zwei Gründe: Eine Erinnerung an jemanden, der sich vor Monaten eingetragen
 * hat, wirkt befremdlich statt hilfreich. Und ohne diese Grenze würde die
 * Strecke beim ersten Lauf über den gesamten Altbestand gehen und auf einen
 * Schlag Mails an Leute schicken, die längst abgeschlossen sind.
 */
const MAX_ALTER_TAGE = 14;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

const json = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const vorname = (full: string): string => full.trim().split(/\s+/)[0] ?? "";

/** Störungen ans Team — sonst läuft ein stiller Ausfall tagelang weiter. */
async function meldeStoerung(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error("Stoerung, aber Telegram nicht konfiguriert:", text);
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `⚠️ Follow-up (lp-start)\n\n${text}`,
      }),
    });
  } catch (e) {
    console.error("Telegram-Meldung fehlgeschlagen:", e);
  }
}

/* ------------------------------------------------------------------ *
 * Datenbank (PostgREST, wie im übrigen Projekt — ohne supabase-js)
 * ------------------------------------------------------------------ */

async function db(pfad: string, init: RequestInit = {}): Promise<Response> {
  return await fetch(`${SUPABASE_URL}/rest/v1/${pfad}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

async function dbJson<T>(pfad: string): Promise<T[]> {
  const res = await db(pfad);
  if (!res.ok) throw new Error(`DB ${res.status}: ${await res.text()}`);
  return (await res.json()) as T[];
}

/** PostgREST-Listen sind kommagetrennt; Werte mit Sonderzeichen gehören in Quotes. */
const inListe = (werte: string[]): string =>
  `(${werte.map((w) => `"${w.replace(/"/g, '\\"')}"`).join(",")})`;

/* ------------------------------------------------------------------ *
 * Mail-Rahmen
 * ------------------------------------------------------------------ */

/**
 * Gemeinsames Gerüst aller drei Mails.
 *
 * Der Preheader ganz oben ist der Text, den Gmail und Apple Mail neben dem
 * Betreff anzeigen. Fehlt er, ziehen sie stattdessen den ersten sichtbaren
 * Text — bei der bestehenden Video-Mail ist das dreimal hintereinander der
 * Markenname. Die zweitwichtigste Fläche im Posteingang steht dann leer.
 */
function rahmen(opts: {
  preheader: string;
  kicker: string;
  headline: string;
  absaetze: string[];
  ctaLabel: string;
  ctaUrl: string;
  ps?: string;
  abmeldeUrl: string;
}): string {
  const absaetze = opts.absaetze
    .map(
      (a) =>
        `<p style="margin:0 0 14px;font-size:15px;color:#4b5563;line-height:1.6;">${a}</p>`,
    )
    .join("");

  const ps = opts.ps
    ? `<p style="margin:18px 0 0;font-size:15px;color:#4b5563;line-height:1.6;"><strong>PS:</strong> ${opts.ps}</p>`
    : "";

  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;">
  <!-- Vorschauzeile: sichtbar nur im Posteingang, nicht in der geöffneten Mail. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(opts.preheader)}</div>
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
                    text-transform:uppercase;">${escapeHtml(opts.kicker)}</p>
          <h1 style="margin:6px 0 14px;font-size:22px;line-height:1.3;color:#111827;">${escapeHtml(opts.headline)}</h1>
          ${absaetze}
        </td></tr>

        <tr><td style="padding:12px 32px 4px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <!-- Padding auf dem td, Link auf 100%: Outlook macht sonst nur den
                 Text klickbar, nicht die farbige Fläche. -->
            <tr><td align="center" bgcolor="${ACCENT}" style="border-radius:8px;padding:14px 28px;">
              <a href="${opts.ctaUrl}" target="_blank"
                 style="display:block;width:100%;font-family:Helvetica,Arial,sans-serif;
                        font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                ${escapeHtml(opts.ctaLabel)}
              </a>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:16px 32px 8px;font-family:Helvetica,Arial,sans-serif;
             font-size:15px;color:#4b5563;line-height:1.6;">
          ${ps}
          <p style="margin:18px 0 0;">Bis bald,<br><strong>OneClick Office Team</strong></p>
        </td></tr>

        <tr><td style="padding:20px 32px 28px;border-top:1px solid #eef0f2;
             font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#9ca3af;line-height:1.5;">
          © 2026 ${BRAND} · <a href="${SITE_URL}" style="color:#9ca3af;">start.oneclick-office.ch</a><br>
          Du bekommst diese Mail, weil du auf unserer Website das Video angefordert hast.<br>
          <a href="${opts.abmeldeUrl}" style="color:#9ca3af;text-decoration:underline;">Keine weiteren Mails dazu</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function textFassung(opts: {
  headline: string;
  absaetze: string[];
  ctaLabel: string;
  ctaUrl: string;
  ps?: string;
  abmeldeUrl: string;
}): string {
  const ohneTags = (v: string) => v.replace(/<[^>]+>/g, "");
  return (
    `${opts.headline}\n\n` +
    opts.absaetze.map(ohneTags).join("\n\n") +
    `\n\n${opts.ctaLabel}:\n${opts.ctaUrl}\n` +
    (opts.ps ? `\nPS: ${ohneTags(opts.ps)}\n` : "") +
    `\nBis bald,\nOneClick Office Team\n\n` +
    `Keine weiteren Mails dazu: ${opts.abmeldeUrl}`
  );
}

/* ------------------------------------------------------------------ *
 * Die drei Stufen
 * ------------------------------------------------------------------ */

type Stufe = {
  nummer: 1 | 2 | 3;
  /** Frühestens so viele Stunden nach dem Eintrag. */
  nachStunden: number;
  betreff: string;
  bauen: (name: string, abmeldeUrl: string) => { html: string; text: string };
};

const STUFEN: Stufe[] = [
  {
    nummer: 1,
    nachStunden: 24,
    betreff: "Dein Video wartet noch",
    bauen: (name, abmeldeUrl) => {
      const anrede = name ? `${name}, du` : "Du";
      const inhalt = {
        // Keine Minutenzahl in der Vorschauzeile: Dort entscheidet sich, ob
        // jemand öffnet, und eine Zeitangabe liest sich an dieser Stelle als
        // Aufwand. Im Text darunter hilft sie dagegen — wer schon offen hat,
        // will wissen, worauf er sich einlässt.
        preheader: "Es geht nicht darum, deine Software zu ersetzen — das überrascht die meisten.",
        kicker: "Noch nicht angesehen",
        headline: name ? `${name}, dein Video liegt bereit` : "Dein Video liegt bereit",
        absaetze: [
          `${anrede} hast dir gestern das Video freischalten lassen — angeschaut hast du es noch nicht. Kein Vorwurf, der Tag ist voll.`,
          "Es dauert <strong>6:33 Minuten</strong>. Darin geht es darum, welche Schritte im Monat am meisten Zeit kosten und wie sich der Aufwand von Tagen auf Stunden bringen lässt.",
        ],
        ctaLabel: "Video jetzt ansehen",
        ctaUrl: VIDEO_LINK,
        ps: "Unter dem Video steht das Wichtigste auch zum Nachlesen, falls dir Text lieber ist als Ton.",
        abmeldeUrl,
      };
      return { html: rahmen(inhalt), text: textFassung(inhalt) };
    },
  },
  {
    nummer: 2,
    nachStunden: 72,
    betreff: "Der Teil, der meistens überrascht",
    bauen: (name, abmeldeUrl) => {
      const anrede = name ? `${name}, du` : "Du";
      const inhalt = {
        preheader: "Vier Fragen, an denen sich fast immer zeigt, wo die Zeit hängt.",
        kicker: "Weiterschauen",
        headline: "Du warst schon drin — aber nicht bis zum Ende",
        absaetze: [
          `${anrede} hast das Video gestartet und irgendwo unterwegs aufgehört. Der Teil, der die meisten überrascht, kommt weiter hinten: die vier Fragen, an denen sich fast immer zeigt, wo die Zeit tatsächlich verloren geht.`,
          "Und der Satz, der dahintersteht: Es geht nicht darum, dir neue Software zu verkaufen. Läuft ein Programm bei dir seit Jahren gut, bleibt es.",
        ],
        ctaLabel: "Da weiterschauen, wo du aufgehört hast",
        ctaUrl: VIDEO_LINK,
        ps: "Bei Luca sind aus rund 1.5 Arbeitstagen Administration im Monat wenige Stunden geworden. Wie das ging, steht im letzten Drittel.",
        abmeldeUrl,
      };
      return { html: rahmen(inhalt), text: textFassung(inhalt) };
    },
  },
  {
    nummer: 3,
    nachStunden: 120,
    betreff: "Was ein Erstgespräch bei uns nicht ist",
    bauen: (name, abmeldeUrl) => {
      const inhalt = {
        preheader: "Kein Verkaufsgespräch, kein Pauschalpreis, keine Verpflichtung.",
        kicker: "Kostenloses Erstgespräch",
        headline: name ? `${name}, ein Satz zum Gespräch` : "Ein Satz zum Gespräch",
        absaetze: [
          "Du hast das Video zu Ende geschaut — danke dafür. Einen Termin hast du nicht gebucht, und das hat meistens denselben Grund: die Sorge, in einem Verkaufsgespräch zu landen.",
          "Ist es nicht. Wir schauen uns an, wie deine Administration heute läuft, und sagen dir, welche Schritte sich sinnvoll vereinfachen lassen — auch dann, wenn die Antwort lautet: bei dir lohnt sich das nicht.",
          "Einen Pauschalpreis nennen wir bewusst erst, wenn klar ist, was bei dir überhaupt Sinn ergibt.",
        ],
        ctaLabel: "Kostenloses Erstgespräch buchen",
        ctaUrl: BUCHUNG_URL,
        ps: "Wenn gerade nichts ansteht, ist das auch in Ordnung — dann melden wir uns nicht weiter.",
        abmeldeUrl,
      };
      return { html: rahmen(inhalt), text: textFassung(inhalt) };
    },
  },
];

/* ------------------------------------------------------------------ *
 * Versandlauf
 * ------------------------------------------------------------------ */

type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  meta_event_id: string | null;
  created_at: string;
};

type LpEvent = { session_id: string; event: string; meta: Record<string, unknown> | null };

/** Token für den Abmeldelink — eine nicht erratbare Kennung, die schon am Lead hängt. */
const abmeldeToken = (lead: Lead): string => lead.meta_event_id ?? lead.id;

const abmeldeUrlFuer = (lead: Lead): string =>
  `${SUPABASE_URL}/functions/v1/send-followup?abmelden=${encodeURIComponent(abmeldeToken(lead))}`;

/**
 * Welche Stufe ist für diesen Stand fällig — falls überhaupt eine?
 *
 * Bewusst frei von Datenbank und Versand, damit sich die Entscheidung prüfen
 * lässt: Sie bestimmt, wer welche Mail bekommt, und ein Fehler darin schickt
 * jemandem „du hast das Video noch nicht angesehen", obwohl er es zu Ende
 * gesehen hat.
 *
 * Höchste Stufe zuerst: Wer schon weit gekommen ist, soll nicht mit einer
 * Erinnerung von ganz vorn behelligt werden.
 */
export function waehleStufe(stand: {
  alterStunden: number;
  hatGestartet: boolean;
  hatBeendet: boolean;
  willBuchen: boolean;
  schonGesendet: (stufe: number) => boolean;
}): Stufe | null {
  for (const stufe of [...STUFEN].reverse()) {
    if (stand.alterStunden < stufe.nachStunden) continue;
    if (stand.schonGesendet(stufe.nummer)) continue;

    const passt =
      (stufe.nummer === 1 && !stand.hatGestartet) ||
      (stufe.nummer === 2 && stand.hatGestartet && !stand.hatBeendet) ||
      (stufe.nummer === 3 && stand.hatBeendet && !stand.willBuchen);

    if (passt) return stufe;
  }
  return null;
}

async function versandlauf() {
  const jetzt = Date.now();
  // Die kleinste Schwelle aller Stufen — alles Jüngere kann noch gar nicht fällig sein.
  const fruehestens = Math.min(...STUFEN.map((s) => s.nachStunden));
  const grenze = new Date(jetzt - fruehestens * 3600_000).toISOString();

  const aeltesteGrenze = new Date(jetzt - MAX_ALTER_TAGE * 24 * 3600_000).toISOString();

  const leads = await dbJson<Lead>(
    `leads?source=eq.${QUELLE}` +
      `&followup_abgemeldet_am=is.null` +
      `&created_at=lt.${encodeURIComponent(grenze)}` +
      `&created_at=gt.${encodeURIComponent(aeltesteGrenze)}` +
      `&select=id,name,email,meta_event_id,created_at` +
      `&order=created_at.desc&limit=${MAX_PRO_LAUF}`,
  );

  if (leads.length === 0) {
    return { geprueft: 0, gesendet: 0, stufen: {} as Record<string, number> };
  }

  const ids = leads.map((l) => l.id);

  // Was ging an diese Leads schon raus?
  const protokoll = await dbJson<{ lead_id: string; stufe: number }>(
    `lead_followups?lead_id=in.${inListe(ids)}&select=lead_id,stufe`,
  );
  const bereits = new Set(protokoll.map((p) => `${p.lead_id}:${p.stufe}`));

  /* Wie weit ist jemand im Video gekommen?
     Die Brücke zwischen Lead und Verhalten ist meta_event_id: Sie steht am
     Lead und am zugehörigen lead_submit-Ereignis, über das sich die Sitzung
     finden lässt. Die Ereignistabelle selbst führt bewusst keine Kontaktdaten. */
  const eventIds = leads.map((l) => l.meta_event_id).filter((v): v is string => Boolean(v));

  /* Ein Lead kann mehrere Sitzungen haben: die beim Eintragen und jede spätere
     Rückkehr über den Link aus der Video-Mail (dort hängt `fu` am Link und
     landet in der Ereignis-Meta). Ohne den zweiten Weg gälte jemand, der das
     Video erst aus der Mail heraus zu Ende schaut, weiterhin als „nie
     geöffnet" — und bekäme genau das als Erinnerung geschickt. */
  const sitzungenJeLead = new Map<string, Set<string>>();
  const merke = (leadKennung: string, sitzung: string) => {
    if (!leadKennung || !sitzung) return;
    const menge = sitzungenJeLead.get(leadKennung) ?? new Set<string>();
    menge.add(sitzung);
    sitzungenJeLead.set(leadKennung, menge);
  };

  if (eventIds.length > 0) {
    const submits = await dbJson<{ session_id: string; meta_event_id: string }>(
      `lp_events?meta_event_id=in.${inListe(eventIds)}` +
        `&event=eq.lead_submit&select=session_id,meta_event_id`,
    );
    for (const s of submits) merke(s.meta_event_id, s.session_id);

    const rueckkehr = await dbJson<{ session_id: string; meta: Record<string, unknown> | null }>(
      `lp_events?meta->>fu=in.${inListe(eventIds)}&select=session_id,meta`,
    );
    for (const r of rueckkehr) merke(String((r.meta ?? {}).fu ?? ""), r.session_id);
  }

  const sessionIds = [...new Set([...sitzungenJeLead.values()].flatMap((m) => [...m]))];
  const eventsJeSitzung = new Map<string, LpEvent[]>();
  if (sessionIds.length > 0) {
    const events = await dbJson<LpEvent>(
      `lp_events?session_id=in.${inListe(sessionIds)}` +
        `&event=in.${inListe(["video_play", "video_complete", "cta_click"])}` +
        `&select=session_id,event,meta`,
    );
    for (const e of events) {
      const liste = eventsJeSitzung.get(e.session_id) ?? [];
      liste.push(e);
      eventsJeSitzung.set(e.session_id, liste);
    }
  }

  let gesendet = 0;
  const stufenZaehler: Record<string, number> = {};

  for (const lead of leads) {
    if (!lead.email) continue;

    const sitzungen = lead.meta_event_id
      ? (sitzungenJeLead.get(lead.meta_event_id) ?? new Set<string>())
      : new Set<string>();
    const events = [...sitzungen].flatMap((sid) => eventsJeSitzung.get(sid) ?? []);

    const hatGestartet = events.some((e) => e.event === "video_play");
    const hatBeendet = events.some((e) => e.event === "video_complete");
    const willBuchen = events.some(
      (e) =>
        e.event === "cta_click" &&
        String((e.meta ?? {}).cta_id ?? "").startsWith("booking"),
    );

    const alterStunden = (jetzt - new Date(lead.created_at).getTime()) / 3600_000;

    const faellig = waehleStufe({
      alterStunden,
      hatGestartet,
      hatBeendet,
      willBuchen,
      schonGesendet: (nummer) => bereits.has(`${lead.id}:${nummer}`),
    });
    if (!faellig) continue;

    /* Erst eintragen, dann senden.
       Der Unique-Index auf (lead_id, stufe) ist damit die Sperre: Läuft der Job
       doppelt oder überschneiden sich zwei Läufe, scheitert der zweite Eintrag
       mit 409 und es geht keine zweite Mail raus. Andersherum — senden, dann
       eintragen — würde ein Fehler beim Eintragen die Mail beim nächsten Lauf
       wiederholen. Eine ausgefallene Mail ist verkraftbar, eine doppelte nicht. */
    const eintrag = await db("lead_followups", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ lead_id: lead.id, stufe: faellig.nummer }),
    });
    if (eintrag.status === 409) continue; // ein anderer Lauf war schneller
    if (!eintrag.ok) {
      await meldeStoerung(
        `Protokolleintrag fehlgeschlagen (Lead ${lead.id}, Stufe ${faellig.nummer}): ` +
          `${eintrag.status} ${(await eintrag.text()).slice(0, 200)}`,
      );
      continue;
    }

    const { html, text } = faellig.bauen(vorname(lead.name ?? ""), abmeldeUrlFuer(lead));

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [lead.email],
        reply_to: MAIL_REPLY_TO,
        subject: faellig.betreff,
        html,
        text,
        // Ein-Klick-Abmeldung: Seit den Gmail-/Yahoo-Anforderungen 2024 zählt
        // dieser Kopf in die Absenderbewertung. Wer sich nicht abmelden kann,
        // drückt „Spam" — und das kostet die Zustellung aller Mails.
        headers: {
          "List-Unsubscribe": `<${abmeldeUrlFuer(lead)}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      }),
    });

    if (!res.ok) {
      await meldeStoerung(
        `Stufe ${faellig.nummer} an ${lead.email} fehlgeschlagen (Resend ${res.status}).\n` +
          `${(await res.text()).slice(0, 300)}`,
      );
      continue;
    }

    gesendet++;
    stufenZaehler[`stufe${faellig.nummer}`] =
      (stufenZaehler[`stufe${faellig.nummer}`] ?? 0) + 1;
  }

  return { geprueft: leads.length, gesendet, stufen: stufenZaehler };
}

/* ------------------------------------------------------------------ *
 * Abmeldung
 * ------------------------------------------------------------------ */

const abmeldeSeite = (ok: boolean) =>
  new Response(
    `<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${ok ? "Abgemeldet" : "Link nicht gültig"}</title></head>
<body style="margin:0;font-family:Helvetica,Arial,sans-serif;background:#f4f4f5;">
<div style="max-width:520px;margin:12vh auto;background:#fff;border-radius:12px;padding:32px;text-align:center;">
<h1 style="font-size:20px;color:#111827;margin:0 0 10px;">${
      ok ? "Erledigt — keine weiteren Mails." : "Dieser Link gilt nicht mehr."
    }</h1>
<p style="font-size:15px;color:#4b5563;line-height:1.6;margin:0;">${
      ok
        ? "Du bekommst von uns keine Folgemails mehr zum Video. Der Link zum Video selbst funktioniert weiterhin."
        : "Möglicherweise hast du dich bereits abgemeldet. Schreib uns sonst kurz, wir erledigen es von Hand."
    }</p>
<p style="margin:22px 0 0;"><a href="${SITE_URL}" style="color:${ACCENT};font-size:14px;">Zur Website</a></p>
</div></body></html>`,
    { status: ok ? 200 : 404, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );

/* ------------------------------------------------------------------ *
 * Einstieg
 * ------------------------------------------------------------------ */

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const abmelden = url.searchParams.get("abmelden");

  /* Abmeldung: bewusst OHNE Shared-Secret — der Link wird aus der Mail heraus
     angeklickt. Der Token ist eine Zufallskennung und nicht zu erraten.
     Gmail schickt für die Ein-Klick-Abmeldung ein POST, Menschen ein GET. */
  if (abmelden) {
    if (!SUPABASE_URL || !SERVICE_KEY) return abmeldeSeite(false);
    try {
      const res = await db(
        `leads?or=(meta_event_id.eq.${encodeURIComponent(abmelden)},id.eq.${encodeURIComponent(abmelden)})`,
        {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({ followup_abgemeldet_am: new Date().toISOString() }),
        },
      );
      if (!res.ok) return abmeldeSeite(false);
      const betroffen = (await res.json()) as unknown[];
      return abmeldeSeite(betroffen.length > 0);
    } catch (e) {
      console.error("Abmeldung fehlgeschlagen:", e);
      return abmeldeSeite(false);
    }
  }

  if (req.method !== "POST") return json(405, { error: "method not allowed" });

  const provided = req.headers.get("x-webhook-secret") ?? "";
  if (!WEBHOOK_SECRET || provided !== WEBHOOK_SECRET) {
    return json(401, { error: "unauthorized" });
  }

  /* Probeversand: schickt eine bestimmte Stufe an eine frei gewählte Adresse,
     ohne Rücksicht auf Alter und Fortschritt und ohne Protokolleintrag. Damit
     lassen sich die Texte ansehen, ohne den ganzen Funnel zu durchlaufen — und
     ohne dass der Empfänger dadurch als versorgt gilt.

       POST ?probe=1   { "an": "…@…", "stufe": 1, "name": "Vorname" }

     `stufe` weglassen heisst: alle drei nacheinander. */
  if (url.searchParams.get("probe") === "1") {
    if (!RESEND_API_KEY) return json(500, { error: "RESEND_API_KEY not configured" });

    let körper: Record<string, unknown> = {};
    try {
      körper = await req.json();
    } catch {
      /* leerer Body ist erlaubt */
    }

    const an = String(körper.an ?? "").trim();
    if (!an.includes("@")) return json(422, { error: "Feld 'an' fehlt oder ist keine Adresse" });

    const name = String(körper.name ?? "").trim();
    const gewuenscht = Number(körper.stufe ?? 0);
    const zuSenden = gewuenscht ? STUFEN.filter((s) => s.nummer === gewuenscht) : STUFEN;
    if (zuSenden.length === 0) return json(422, { error: "stufe muss 1, 2 oder 3 sein" });

    // Abmeldelink zeigt auf eine Kennung, die es nicht gibt — der Link ist
    // klickbar und zeigt die Fehlerseite, statt versehentlich jemanden abzumelden.
    const abmelde = `${SUPABASE_URL}/functions/v1/send-followup?abmelden=probe-ohne-wirkung`;

    const ergebnis: Record<string, string> = {};
    for (const stufe of zuSenden) {
      const { html, text } = stufe.bauen(vorname(name), abmelde);
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: MAIL_FROM,
          to: [an],
          reply_to: MAIL_REPLY_TO,
          subject: stufe.betreff,
          html,
          text,
          headers: {
            "List-Unsubscribe": `<${abmelde}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        }),
      });
      ergebnis[`stufe${stufe.nummer}`] = res.ok
        ? `gesendet: ${stufe.betreff}`
        : `FEHLER ${res.status}: ${(await res.text()).slice(0, 200)}`;
    }
    return json(200, { ok: true, an, probeversand: ergebnis });
  }

  // Probelauf: zeigt die Einstellungen, ohne zu senden.
  if (url.searchParams.get("diag") === "1") {
    return json(200, {
      quelle: QUELLE,
      stufen: STUFEN.map((s) => ({
        nummer: s.nummer,
        nachStunden: s.nachStunden,
        betreff: s.betreff,
      })),
      maxProLauf: MAX_PRO_LAUF,
      maxAlterTage: MAX_ALTER_TAGE,
      resendKey: RESEND_API_KEY ? "gesetzt" : "FEHLT",
      absender: MAIL_FROM,
      datenbank: SUPABASE_URL && SERVICE_KEY ? "erreichbar konfiguriert" : "NICHT konfiguriert",
    });
  }

  if (!RESEND_API_KEY) {
    await meldeStoerung("Kein Resend-API-Schlüssel hinterlegt — es geht keine Folgemail raus.");
    return json(500, { error: "RESEND_API_KEY not configured" });
  }
  if (!SUPABASE_URL || !SERVICE_KEY) {
    await meldeStoerung("SUPABASE_URL oder SERVICE_ROLE_KEY fehlt — Folgestrecke steht still.");
    return json(500, { error: "supabase env missing" });
  }

  try {
    const ergebnis = await versandlauf();
    return json(200, { ok: true, ...ergebnis });
  } catch (e) {
    const text = e instanceof Error ? e.message : String(e);
    console.error("Versandlauf fehlgeschlagen:", text);
    await meldeStoerung(`Versandlauf abgebrochen: ${text.slice(0, 400)}`);
    return json(500, { error: text });
  }
});
