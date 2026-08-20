/**
 * Tracking / Consent Mode v2
 * --------------------------
 * GTM und die Consent-Defaults werden bereits in index.html geladen (so früh
 * wie möglich). Standard dort: analytics_storage = granted (Reichweitenmessung
 * als Opt-out), Werbe-Signale (ad_*) = denied bis zur Einwilligung.
 *
 * Dieses Modul kümmert sich nur noch um die Einwilligung (consent 'update') und
 * ums Schreiben der Funnel-Events. „Akzeptieren" schaltet alles auf granted,
 * „Ablehnen" alles auf denied (auch Analytics — aktiver Widerspruch gilt).
 *
 * Übernommen aus apps/oneclickoffice-demo, ohne die dortige iframe-Logik: hier
 * gibt es keine eingebettete Demo, die Seite läuft immer im Top-Fenster.
 */

import { trackEvent } from "./trackEvent";

const CONSENT_KEY = "oco_cookie_consent"; // "granted" | "denied"
export const CONSENT_CHANGE_EVENT = "oco:consent-change";
export const OPEN_CONSENT_EVENT = "oco:open-consent";

export type ConsentState = "granted" | "denied" | null;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const isBrowser = typeof window !== "undefined";

const CONSENT_KEYS = [
  "ad_storage",
  "ad_user_data",
  "ad_personalization",
  "analytics_storage",
  "functionality_storage",
  "personalization_storage",
] as const;

const consentPayload = (value: "granted" | "denied") =>
  Object.fromEntries(CONSENT_KEYS.map((k) => [k, value]));

const gtag = (...args: unknown[]) => {
  if (isBrowser && typeof window.gtag === "function") window.gtag(...args);
};

export const getConsent = (): ConsentState => {
  if (!isBrowser) return null;
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
};

/** Einwilligung speichern und an Google Consent Mode melden. */
export const setConsent = (state: "granted" | "denied") => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(CONSENT_KEY, state);
  } catch {
    /* localStorage nicht verfügbar — Wahl gilt dann nur für diese Sitzung */
  }
  gtag("consent", "update", consentPayload(state));
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: state }));
};

/** Consent-Banner erneut öffnen (Footer-Link). */
export const openConsentSettings = () => {
  if (isBrowser) window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
};

/**
 * Welche Funnel-Schritte der Meta-Pixel als eigenes Ereignis melden soll.
 *
 * Hintergrund: Der Pixel meldete bisher nur den fertigen Lead. Meta braucht
 * aber rund 50 Ereignisse pro Woche und Anzeigengruppe, um zuverlässig zu
 * lernen — bei kleinem Budget erreicht man das mit Leads allein oft nicht.
 * Mit diesen Zwischenschritten lässt sich notfalls auf ein häufigeres Ereignis
 * optimieren, und im Werbeanzeigenmanager wird sichtbar, wo Leute abspringen.
 *
 * Bewusst Meta-Standardereignisse statt eigener Namen: nur auf die kann im
 * Anzeigenmanager direkt optimiert werden.
 */
const metaEventFuer = (event: string, params: Record<string, unknown>): string | null => {
  if (event === "lead_submit") return "Lead"; // die eigentliche Conversion
  if (event === "lead_start") return "InitiateCheckout"; // Formular begonnen
  if (event === "cta_click") {
    const id = String(params.cta_id ?? "");
    if (id === "video_poster" || id === "hero_button") return "ViewContent"; // Opt-in geöffnet
    if (id.startsWith("booking")) return "Schedule"; // Richtung Terminbuchung
  }
  return null;
};

/**
 * Ein Funnel-Ereignis an alle drei Stellen melden:
 *
 * 1. dataLayer (GTM/GA4) — ob daraus ein voller oder ein cookieloser Hit wird,
 *    entscheidet Consent Mode v2 in GTM.
 * 2. Eigene Datenbank — die einzige Quelle, die auch mit Adblocker zählt und
 *    sich als Funnel auswerten lässt.
 * 3. Meta-Pixel — nur für die Schritte, auf die sich optimieren lässt.
 *
 * Alle drei sind fire-and-forget: Ein Tracking-Ausfall darf nie einen Lead
 * kosten.
 */
export const track = (event: string, params: Record<string, unknown> = {}) => {
  if (!isBrowser) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });

  trackEvent(event, params);

  const metaEvent = metaEventFuer(event, params);
  if (metaEvent) trackMeta(metaEvent);
};

/**
 * Meta-Pixel-Event senden. Der Pixel wird in index.html geladen und feuert —
 * wie der PageView — unabhängig vom Cookie-Banner; hier wird nur ein Standard-
 * oder Custom-Event nachgeschoben (z. B. „Lead").
 */
export const trackMeta = (event: string, params: Record<string, unknown> = {}) => {
  if (!isBrowser || typeof window.fbq !== "function") return;
  window.fbq("track", event, params);
};
