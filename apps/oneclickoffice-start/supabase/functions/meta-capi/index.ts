// meta-capi: meldet einen neuen Lead über die Meta Conversions API.
//
// Warum es das braucht: Der Browser-Pixel wird bei 20–40 % der Besucher von
// Adblockern und Tracking-Schutz verschluckt. Was Meta nicht sieht, kann Meta
// nicht zum Optimieren nutzen — die Kampagne lernt dann aus einem verzerrten
// Ausschnitt. Diese Meldung geht von Server zu Server, daran kommt kein
// Blocker vorbei.
//
// Aufruf: DB-Trigger trg_meta_capi (pg_net) bei INSERT in public.leads, nur für
// source = 'lp-start'.
//
// Deduplizierung: Der Browser meldet dieselbe Conversion (falls er durchkommt)
// mit derselben event_id. Meta führt beide zu einem Ereignis zusammen. Ohne das
// würde jede Conversion doppelt gezählt.
//
// Datenschutz: E-Mail, Telefon und Name verlassen das System ausschliesslich
// als SHA-256-Hash — so verlangt es Meta, und so kann aus der Übertragung
// niemand die Klardaten zurückgewinnen.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PIXEL_ID = Deno.env.get("META_PIXEL_ID") ?? "1040498465323715";
const ACCESS_TOKEN = Deno.env.get("META_CAPI_ACCESS_TOKEN") ?? "";
const API_VERSION = Deno.env.get("META_API_VERSION") ?? "v21.0";

// Solange gesetzt, tauchen die Meldungen im Events Manager unter
// "Testereignisse" auf — praktisch zum Prüfen, MUSS für den Echtbetrieb aber
// wieder weg, sonst zählt Meta sie nicht als echte Conversions.
const TEST_EVENT_CODE = Deno.env.get("META_TEST_EVENT_CODE") ?? "";

const WEBHOOK_SECRET =
  Deno.env.get("META_CAPI_SECRET") ?? Deno.env.get("LEAD_NOTIFY_SECRET") ?? "";

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

/** SHA-256, hex-kodiert — das Format, das Meta für personenbezogene Felder verlangt. */
async function sha256(value: string): Promise<string> {
  const daten = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", daten);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Telefonnummer auf das von Meta erwartete Format bringen: nur Ziffern,
 * mit Ländervorwahl, ohne Pluszeichen. Schweizer Eingaben kommen in allen
 * Varianten ("076 493 02 08", "+41 76 493 02 08", "0041 76 ..."), und ohne
 * saubere Vereinheitlichung findet Meta die Person nicht wieder.
 */
function normalisiereTelefon(roh: string): string | null {
  let ziffern = (roh ?? "").replace(/[^\d]/g, "");
  if (!ziffern) return null;
  if (ziffern.startsWith("00")) ziffern = ziffern.slice(2);        // 0041... -> 41...
  else if (ziffern.startsWith("0")) ziffern = `41${ziffern.slice(1)}`; // 076... -> 4176...
  else if (!ziffern.startsWith("41") && ziffern.length <= 10) ziffern = `41${ziffern}`;
  return ziffern.length >= 10 ? ziffern : null;
}

/** Meta erwartet Namen klein und ohne Zusätze. */
const normalisiereName = (v: string): string =>
  (v ?? "").trim().toLowerCase().replace(/[^\p{L}\s-]/gu, "");

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
    /* leerer Body -> als leeres Objekt behandeln */
  }

  // Diagnose ohne Versand: zeigt, ob Token und Pixel-ID ankommen.
  if (body.diag === true) {
    return json(200, {
      pixelId: PIXEL_ID,
      tokenGesetzt: ACCESS_TOKEN ? "ja" : "NEIN",
      tokenLaenge: ACCESS_TOKEN.length,
      apiVersion: API_VERSION,
      testEventCode: TEST_EVENT_CODE || "(keiner — Echtbetrieb)",
    });
  }

  if (!ACCESS_TOKEN) return json(500, { error: "META_CAPI_ACCESS_TOKEN fehlt" });

  const lead = ((body.record ?? body.lead ?? body) ?? {}) as Record<string, unknown>;

  const email = String(lead.email ?? "").trim().toLowerCase();
  const telefon = normalisiereTelefon(String(lead.telefon ?? ""));
  const nameTeile = String(lead.name ?? "").trim().split(/\s+/);
  const vorname = normalisiereName(nameTeile[0] ?? "");
  const nachname = normalisiereName(nameTeile.slice(1).join(" "));

  if (!email) return json(422, { error: "kein Lead mit E-Mail" });

  const ctx = (lead.meta_context ?? {}) as Record<string, string>;

  // user_data: alles Personenbezogene ausschliesslich gehasht.
  const userData: Record<string, unknown> = { em: [await sha256(email)] };
  if (telefon) userData.ph = [await sha256(telefon)];
  if (vorname) userData.fn = [await sha256(vorname)];
  if (nachname) userData.ln = [await sha256(nachname)];
  // Diese beiden verbessern die Zuordnung erheblich und sind NICHT zu hashen.
  if (ctx.fbc) userData.fbc = ctx.fbc;
  if (ctx.fbp) userData.fbp = ctx.fbp;
  if (ctx.user_agent) userData.client_user_agent = ctx.user_agent;

  const nutzlast: Record<string, unknown> = {
    data: [
      {
        event_name: "Lead",
        // Zeitpunkt des Leads, nicht der Meldung — Meta akzeptiert bis 7 Tage rückwirkend.
        event_time: Math.floor(
          new Date(String(lead.created_at ?? new Date().toISOString())).getTime() / 1000,
        ),
        event_id: String(lead.meta_event_id ?? lead.id ?? ""),
        action_source: "website",
        event_source_url: ctx.event_source_url ?? "https://start.oneclick-office.ch/",
        user_data: userData,
      },
    ],
  };
  if (TEST_EVENT_CODE) nutzlast.test_event_code = TEST_EVENT_CODE;

  const res = await fetch(
    `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(ACCESS_TOKEN)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nutzlast),
    },
  );

  const antwort = await res.text();
  if (!res.ok) {
    console.error("meta capi failed:", res.status, antwort);
    return json(502, { error: `meta ${res.status}`, detail: antwort });
  }

  console.log("meta capi ok:", antwort);
  return json(200, { ok: true, meta: JSON.parse(antwort || "{}") });
});
