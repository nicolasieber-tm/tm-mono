/* =================================================================
   Anonyme Reichweitenmessung für die Branchen-Landingpages.

   Schreibt in dieselbe Tabelle `lp_events` wie start.oneclick-office.ch
   (Supabase-Projekt uzsyjoicirquqjejmutf), unterscheidbar über `source`
   ("tm-handwerk" usw.). Keine IP, kein Name, keine E-Mail, keine
   Werbe-Kennungen: nur Ereignis, Zeitpunkt, Pfad, Gerätetyp, UTM-Parameter
   und eine Zufallskennung pro Besuch (sessionStorage, endet mit dem Tab).

   Auswertung: siehe View v_tm_nischen (README).

   Grundsatz: Tracking darf nie etwas kaputt machen. Fehler werden
   geschluckt, nichts wird abgewartet.
   ================================================================= */

export const SUPABASE_URL = "https://uzsyjoicirquqjejmutf.supabase.co";
// öffentlicher anon-Key: darf in lp_events schreiben und die Edge Function `rueckruf` aufrufen, sonst nichts lesen
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6c3lqb2ljaXJxdXFqZWptdXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MTk3MDUsImV4cCI6MjA3NDM5NTcwNX0.I6Fcx1mhwG-7pWXu0tQoNacY-romV_N3bCy_3BNS6L0";

const SESSION_KEY = "tm_session_id";
const UTM_KEY = "tm_utm";
const UTM_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

const isBrowser = typeof window !== "undefined";

function sessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `nostore-${Math.random().toString(36).slice(2)}`;
  }
}

/** UTM-Parameter beim ersten Aufruf merken, damit sie den ganzen Besuch gelten */
export function utmParams(): Record<string, string> {
  try {
    const p = new URLSearchParams(window.location.search);
    const now: Record<string, string> = {};
    for (const k of UTM_FIELDS) {
      const v = p.get(k);
      if (v) now[k] = v.slice(0, 200);
    }
    if (Object.keys(now).length) {
      sessionStorage.setItem(UTM_KEY, JSON.stringify(now));
      return now;
    }
    const saved = sessionStorage.getItem(UTM_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

const device = () => (window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop");

export function track(source: string, event: string, meta: Record<string, unknown> = {}): void {
  if (!isBrowser) return;
  try {
    // lokale Entwicklung und Vorschau nicht mitzählen
    if (/^(localhost|127\.|\[::1\])/.test(window.location.hostname)) return;
    void fetch(`${SUPABASE_URL}/rest/v1/lp_events`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        source,
        event,
        session_id: sessionId(),
        path: window.location.pathname,
        device: device(),
        referrer: document.referrer ? document.referrer.slice(0, 500) : null,
        utm: utmParams(),
        meta,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* egal */
  }
}
