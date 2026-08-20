/**
 * Anonymes Funnel-Tracking in die eigene Datenbank.
 * -------------------------------------------------
 * Warum zusätzlich zu GTM und Meta-Pixel: Beide werden von Adblockern
 * geschluckt und liefern je nach Publikum 20–40 % weniger Ereignisse. Für die
 * Frage „von 200 Besuchern wie viele Leads?" braucht es eine Quelle, die jeden
 * mitzählt — und eine, die sich als Funnel auswerten lässt.
 *
 * Bewusst OHNE Personenbezug: keine IP, kein Name, keine E-Mail. Die
 * session_id ist eine Zufallszahl, die nur für die Dauer eines Besuchs im
 * Browser liegt. Damit ist das reine Reichweitenmessung und braucht keine
 * Einwilligung.
 *
 * Grundsatz: Das hier darf NIE etwas kaputt machen. Jeder Fehler wird
 * geschluckt, nichts wird abgewartet — ein Tracking-Ausfall darf einen Lead
 * nicht kosten.
 */

const SUPABASE_URL = "https://uzsyjoicirquqjejmutf.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6c3lqb2ljaXJxdXFqZWptdXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MTk3MDUsImV4cCI6MjA3NDM5NTcwNX0.I6Fcx1mhwG-7pWXu0tQoNacY-romV_N3bCy_3BNS6L0";

/** Muss zum Feld `source` der leads-Tabelle passen, damit sich beides verbinden lässt. */
const SOURCE = "lp-start";

const SESSION_KEY = "oco_session_id";
const UTM_KEY = "oco_utm";

import { metaContext } from "./metaContext";

const isBrowser = typeof window !== "undefined";

/** Zufällige Kennung pro Besuch. Überlebt Seitenwechsel, nicht den Tab-Schluss. */
const sessionId = (): string => {
  if (!isBrowser) return "server";
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // Privatmodus: dann eben pro Seitenaufruf eine neue Kennung.
    return `nostore-${Math.random().toString(36).slice(2)}`;
  }
};

/**
 * Kampagnen-Parameter aus der URL. Beim ersten Aufruf gemerkt, damit sie auch
 * auf der Video-Seite noch bekannt sind — dorthin führt kein Anzeigenlink.
 */
const utmParams = (): Record<string, string> => {
  if (!isBrowser) return {};
  try {
    const gemerkt = sessionStorage.getItem(UTM_KEY);
    const aktuell: Record<string, string> = {};
    const p = new URLSearchParams(window.location.search);
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"]) {
      const v = p.get(key);
      if (v) aktuell[key] = v.slice(0, 200);
    }
    if (Object.keys(aktuell).length > 0) {
      sessionStorage.setItem(UTM_KEY, JSON.stringify(aktuell));
      return aktuell;
    }
    return gemerkt ? JSON.parse(gemerkt) : {};
  } catch {
    return {};
  }
};

const device = (): string =>
  isBrowser && window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";

/**
 * Ereignis wegschicken. Bewusst ohne await und ohne Fehlerbehandlung nach
 * aussen: Der Aufrufer soll nicht warten und nicht scheitern können.
 * keepalive sorgt dafür, dass die Meldung auch dann noch rausgeht, wenn der
 * Nutzer im selben Moment die Seite wechselt (z. B. beim Absenden).
 */
export const trackEvent = (
  event: string,
  meta: Record<string, unknown> = {},
  metaEventId?: string,
): void => {
  if (!isBrowser) return;

  try {
    const body = JSON.stringify({
      source: SOURCE,
      event,
      session_id: sessionId(),
      path: window.location.pathname,
      device: device(),
      referrer: document.referrer ? document.referrer.slice(0, 500) : null,
      utm: utmParams(),
      meta,
      // Damit der Server dasselbe Ereignis an Meta melden kann, ohne dass es
      // doppelt zählt — und mit den Angaben, die nur der Browser kennt.
      meta_event_id: metaEventId ?? null,
      meta_context: metaContext(),
    });

    void fetch(`${SUPABASE_URL}/rest/v1/lp_events`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body,
      keepalive: true,
    }).catch(() => {
      /* Tracking-Ausfall ist egal — Hauptsache der Nutzer merkt nichts davon */
    });
  } catch {
    /* dito */
  }
};
