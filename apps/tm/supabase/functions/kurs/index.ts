// Edge Function `kurs`: alles rund um den 5-Tage-Minikurs (trendingmedia.ch/kurs).
// Supabase-Projekt Orbit (uzsyjoicirquqjejmutf). DB-Teil: apps/tm/supabase/migrations/20261126_kurs_minikurs.sql
//
// POST { action: "anmelden", name, email, firma, branche?, website?, seite?, utm? }
//   Website-Formular. Legt den Lead (und den Orbit-Kontakt) an, schickt sofort
//   Mail 1 (Willkommen + Lektion 1) und meldet neue Anmeldungen per Telegram.
//   Gibt den Kurs-Token nur bei NEUEN Anmeldungen zurück (sonst könnte jeder mit
//   fremder E-Mail-Adresse an den Kurslink kommen).
//
// POST { action: "event", token, event, lektion?, meta? }
//   Kursseite. Protokolliert Lektion offen / Rechner / Aufgaben / Check-Klick /
//   Abmeldung. Heisser Lead (Lektion 4/5, nicht gebucht) → Telegram.
//
// POST { action: "cron", dry_run?, zeit_ignorieren? }  + Header x-webhook-secret
//   Stündlich per pg_cron: verschickt die fälligen Mails 2 bis 8.
//
// POST { action: "vorschau", stufe }  + Header x-webhook-secret
//   Gibt Betreff + HTML einer Mail mit Beispieldaten zurück (zum Prüfen der Texte).
//
// GET/POST ?abmelden=<token>
//   One-Click-Abmeldung (List-Unsubscribe-Post) direkt aus dem Mailprogramm.
//
// verify_jwt ist aus: die Website schickt zwar den anon-Key mit, die
// One-Click-Abmeldung der Mailprogramme aber nicht. Alle Schreibzugriffe laufen
// über security-definer-Funktionen, die nur service_role ausführen darf.

import { kursMail, type MailCtx, type MailLead } from "./mails.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? ""; // trendingmedia-Account
const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID") ?? "";

const MAIL_FROM = Deno.env.get("KURS_MAIL_FROM") ?? "Nicola Sieber <nicola.sieber@trendingmedia.ch>";
const MAIL_REPLY_TO = Deno.env.get("KURS_MAIL_REPLY_TO") ?? "nicola.sieber@trendingmedia.ch";
const SITE = Deno.env.get("KURS_SITE_URL") ?? "https://trendingmedia.ch";
// Widget «Automations-Check 20 Min.» (gleich wie WIDGET_KURS in apps/tm/src/lib/booking.ts)
const WIDGET_ID = Deno.env.get("KURS_WIDGET_ID") ?? "5db0b9be-cf33-4043-813a-f7163e5839a1";
const SELF_URL = `${SUPABASE_URL}/functions/v1/kurs`;

const CTX: MailCtx = { site: SITE, bookingUrl: `https://timetracking.trendingmedia.ch/book-widget/${WIDGET_ID}` };

const EVENTS = ["besuch", "lektion", "video_start", "video_ende", "rechner", "aufgaben", "check_klick", "abmelden"];
const ALLOWED_ORIGINS = [/^https:\/\/(www\.)?trendingmedia\.ch$/, /^https:\/\/[a-z0-9-]+\.up\.railway\.app$/, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/];

const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && ALLOWED_ORIGINS.some((r) => r.test(origin)) ? origin : "https://trendingmedia.ch",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  Vary: "Origin",
});

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const isToken = (t: string) => /^[0-9a-f]{32}$/.test(t);

/* ---------------- Datenbank (PostgREST mit Service-Role) ---------------- */

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  const txt = await res.text();
  if (!res.ok) throw Object.assign(new Error(`${fn} ${res.status}: ${txt}`), { status: res.status, detail: txt });
  return (txt ? JSON.parse(txt) : null) as T;
}

async function rest(pfad: string, init: RequestInit = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${pfad}`, {
    ...init,
    headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  return res;
}

/* ---------------- Telegram ---------------- */

async function telegram(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    const r = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
    });
    if (!r.ok) console.error("Telegram fehlgeschlagen:", r.status, await r.text());
  } catch (e) {
    console.error("Telegram fehlgeschlagen:", e);
  }
}

/* ---------------- Mailversand ---------------- */

async function sendeMail(stufe: number, lead: MailLead & { email: string }): Promise<string> {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY fehlt");
  const m = kursMail(stufe, lead, CTX);
  const abmelden = `${SELF_URL}?abmelden=${lead.token}`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: MAIL_FROM,
      to: [lead.email],
      reply_to: MAIL_REPLY_TO,
      subject: m.subject,
      html: m.html,
      text: m.text,
      headers: {
        "List-Unsubscribe": `<${abmelden}>, <mailto:${MAIL_REPLY_TO}?subject=Abmelden%20Minikurs>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      tags: [{ name: "kampagne", value: "minikurs" }, { name: "stufe", value: String(stufe) }],
    }),
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(`Resend ${res.status}: ${txt}`);
  try { return JSON.parse(txt).id ?? ""; } catch { return ""; }
}

/** Stufe reservieren (Unique-Index verhindert Doppelversand), senden, Ergebnis festhalten. */
async function versende(stufe: number, lead: MailLead & { email: string; lead_id: string }): Promise<"ok" | "schon" | "fehler"> {
  const claim = await rest("kurs_mails?on_conflict=lead_id,stufe", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
    body: JSON.stringify({ lead_id: lead.lead_id, stufe }),
  });
  if (!claim.ok) throw new Error(`kurs_mails ${claim.status}: ${await claim.text()}`);
  const rows = (await claim.json()) as { id: number }[];
  if (!rows.length) return "schon";
  try {
    const id = await sendeMail(stufe, lead);
    await rest(`kurs_mails?id=eq.${rows[0].id}`, { method: "PATCH", body: JSON.stringify({ resend_id: id }) });
    return "ok";
  } catch (e) {
    console.error(`Mail Stufe ${stufe} an Lead ${lead.lead_id} fehlgeschlagen:`, e);
    await rest(`kurs_mails?id=eq.${rows[0].id}`, { method: "DELETE" }); // nächster Lauf versucht es erneut
    return "fehler";
  }
}

/* ---------------- Aktionen ---------------- */

type AnmeldeErgebnis = { status: "neu" | "bestehend"; lead_id: string; token: string; erneut_senden: boolean };

async function anmelden(body: Record<string, unknown>) {
  if (str(body.website, 200)) return { ok: true }; // Honeypot
  const name = str(body.name, 120);
  const email = str(body.email, 200).toLowerCase();
  const firma = str(body.firma, 160);
  const branche = str(body.branche, 80);
  const seite = str(body.seite, 200);
  const referrer = str(body.referrer, 300);
  const utm = body.utm && typeof body.utm === "object" && !Array.isArray(body.utm) ? body.utm : {};

  const r = await rpc<AnmeldeErgebnis>("kurs_anmelden", {
    p_name: name, p_email: email, p_firma: firma, p_branche: branche || null,
    p_quelle: [seite, referrer].filter(Boolean).join(" · ") || null, p_utm: utm,
  });

  const lead = { lead_id: r.lead_id, token: r.token, name, email, firma, aufgaben: null };
  let mail: string = "nicht_noetig";
  if (r.status === "neu") {
    mail = await versende(1, lead);
  } else if (r.erneut_senden) {
    // bestehender Lead meldet sich nochmals an: Link erneut schicken (ohne neue Stufe)
    try { await sendeMail(1, lead); mail = "ok"; } catch (e) { console.error(e); mail = "fehler"; }
  }

  if (r.status === "neu") {
    const kampagne = (utm as Record<string, unknown>).utm_campaign ?? (utm as Record<string, unknown>).utm_source;
    await telegram([
      "🎓 Neue Minikurs-Anmeldung",
      "",
      `👤 ${name}`,
      `🏢 ${firma}${branche ? ` · ${branche}` : ""}`,
      `✉️ ${email}`,
      kampagne ? `🔗 Kampagne: ${kampagne}` : `🔗 ${seite || "/kurs"}`,
      mail === "fehler" ? "⚠️ Willkommensmail konnte NICHT verschickt werden" : "📬 Lektion 1 verschickt",
    ].join("\n"));
  }

  return r.status === "neu" ? { ok: true, token: r.token } : { ok: true };
}

type EventErgebnis = {
  ok: boolean; heiss?: boolean; name?: string; firma?: string; email?: string; branche?: string;
  aufgaben?: string[]; abgemeldet?: boolean; lektionen?: number[];
};

async function ereignis(token: string, event: string, lektion: unknown, meta: unknown) {
  if (!isToken(token) || !EVENTS.includes(event)) return { status: 400, body: { ok: false } };
  const m = meta && typeof meta === "object" && !Array.isArray(meta) ? meta : {};
  if (JSON.stringify(m).length > 4000) return { status: 400, body: { ok: false } };
  const nr = typeof lektion === "number" ? lektion : null;

  const r = await rpc<EventErgebnis>("kurs_event", { p_token: token, p_event: event, p_lektion: nr, p_meta: m });
  if (!r.ok) return { status: 404, body: { ok: false } };

  if (r.heiss) {
    const aufg = (r.aufgaben ?? []).filter(Boolean);
    await telegram([
      "🔥 Minikurs: heisser Lead",
      "",
      `${r.name} (${r.firma}) hat Lektion ${nr} geöffnet und noch keinen Check gebucht.`,
      `✉️ ${r.email}`,
      aufg.length ? `\n📝 Aufgaben:\n${aufg.map((a, i) => `${i + 1}. ${a}`).join("\n")}` : "",
      "",
      "👉 Persönlich nachfassen (Anruf oder Mail). Follow-up in Orbit ist auf heute gesetzt.",
    ].join("\n"));
  }
  if (event === "check_klick") {
    await telegram(`📅 Minikurs: ${r.name} (${r.firma}) hat auf «Check buchen» geklickt${nr ? ` (Lektion ${nr})` : ""}. Buchung im Kalender prüfen.`);
  }

  return {
    status: 200,
    body: { ok: true, name: r.name, email: r.email, firma: r.firma, aufgaben: r.aufgaben ?? [], lektionen: r.lektionen ?? [], abgemeldet: r.abgemeldet },
  };
}

type Faellig = { lead_id: string; stufe: number; token: string; name: string; email: string; firma: string; branche: string | null; aufgaben: string[] | null };

async function cronLauf(body: Record<string, unknown>) {
  const dry = body.dry_run === true;
  const faellig = await rpc<Faellig[]>("kurs_faellige_mails", { p_limit: 40, p_zeit_ignorieren: body.zeit_ignorieren === true });
  if (dry) return { ok: true, dry_run: true, faellig: faellig.map((f) => ({ lead_id: f.lead_id, stufe: f.stufe })) };

  const zahl = { gesendet: 0, schon: 0, fehler: 0 };
  for (const f of faellig) {
    const r = await versende(f.stufe, f);
    zahl[r === "ok" ? "gesendet" : r]++;
  }
  if (zahl.fehler) await telegram(`⚠️ Minikurs-Mails: ${zahl.fehler} von ${faellig.length} fälligen Mails konnten nicht verschickt werden. Logs der Function «kurs» prüfen.`);
  return { ok: true, faellig: faellig.length, ...zahl };
}

const abmeldeSeite = (ok: boolean) =>
  `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Minikurs</title></head>` +
  `<body style="font-family:-apple-system,Helvetica,Arial,sans-serif;background:#fdfbf8;color:#1b1a1e;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px;text-align:center">` +
  `<div><h1 style="font-size:28px">${ok ? "Sie sind abgemeldet." : "Link ungültig."}</h1><p style="color:#6b6a70">${ok ? "Sie bekommen keine weiteren Kurs-Mails." : "Schreiben Sie uns an nicola.sieber@trendingmedia.ch."}</p>` +
  `<p><a href="${SITE}" style="color:#1b1a1e">trendingmedia.ch</a></p></div></body></html>`;

/* ---------------- Router ---------------- */

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = { ...cors(origin), "Content-Type": "application/json" };
  const json = (status: number, data: unknown) => new Response(JSON.stringify(data), { status, headers });

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });

  // One-Click-Abmeldung aus dem Mailprogramm (RFC 8058) bzw. Klick auf den Link
  const url = new URL(req.url);
  const abm = url.searchParams.get("abmelden") ?? "";
  if (abm) {
    let ok = false;
    if (isToken(abm)) {
      try { ok = (await rpc<EventErgebnis>("kurs_event", { p_token: abm, p_event: "abmelden", p_lektion: null, p_meta: { via: "list-unsubscribe" } })).ok; }
      catch (e) { console.error(e); }
    }
    return new Response(req.method === "POST" ? (ok ? "ok" : "unbekannt") : abmeldeSeite(ok), {
      status: ok ? 200 : 404,
      headers: { "Content-Type": req.method === "POST" ? "text/plain" : "text/html; charset=utf-8" },
    });
  }

  if (req.method !== "POST") return json(405, { error: "method not allowed" });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* leer */ }

  try {
    switch (body.action) {
      case "anmelden":
        return json(200, await anmelden(body));

      case "event": {
        const r = await ereignis(str(body.token, 64), str(body.event, 32), body.lektion, body.meta);
        return json(r.status, r.body);
      }

      case "cron":
      case "vorschau": {
        const ok = await rpc<boolean>("kurs_cron_secret_ok", { p_secret: req.headers.get("x-webhook-secret") ?? "" });
        if (!ok) return json(401, { error: "unauthorized" });
        if (body.action === "cron") return json(200, await cronLauf(body));
        const stufe = Number(body.stufe);
        const beispiel: MailLead = { token: "0".repeat(32), name: "Max Muster", firma: "Muster Elektro AG", aufgaben: ["Wochenrapporte nachtragen", "Offerten nachfassen", "Lieferscheine abtippen"] };
        const m = kursMail(stufe, beispiel, CTX);
        return json(200, { subject: m.subject, preheader: m.preheader, html: m.html, text: m.text });
      }

      default:
        return json(400, { error: "unbekannte action" });
    }
  } catch (e) {
    const detail = String((e as { detail?: string }).detail ?? e);
    console.error("kurs:", body.action, detail);
    if (detail.includes("ungueltige_eingabe")) return json(400, { error: "ungueltige_eingabe" });
    if (detail.includes("zu_viele_anfragen")) return json(429, { error: "zu_viele_anfragen" });
    return json(500, { error: "fehler" });
  }
});
