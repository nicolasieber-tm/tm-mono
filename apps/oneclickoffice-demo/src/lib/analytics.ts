/**
 * Tracking / Consent Mode v2
 * --------------------------
 * Google Tag Manager + die Consent-Defaults (alles auf "denied") werden bereits
 * in index.html geladen – so früh wie möglich und nur im obersten Fenster. Die
 * eingebettete Live-Demo (iframe) lädt KEIN GTM; sie meldet ihren Tour-Fortschritt
 * per postMessage an die Landingpage, die ihn hier in den dataLayer schreibt.
 *
 * Dieses Modul kümmert sich nur noch um die Einwilligung (consent 'update') und
 * um das Schreiben der Funnel-Events. Bis zur Einwilligung sendet GA4 dank
 * Consent Mode v2 lediglich cookielose, modellierte Pings.
 */

export const GTM_ID = "GTM-52V9SJ6J";

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
const isTopWindow = () => isBrowser && window.self === window.top;

// Consent-Typen für Consent Mode v2.
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
    /* localStorage nicht verfügbar – Wahl gilt dann nur für diese Sitzung */
  }
  gtag("consent", "update", consentPayload(state));
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: state }));
};

/** Consent-Banner erneut öffnen (z. B. via Footer-Link). */
export const openConsentSettings = () => {
  if (isBrowser) window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
};

/**
 * Funnel-Event in den dataLayer schreiben (nur im Top-Fenster). Ob daraus ein
 * voller oder ein cookieloser GA4-Hit wird, entscheidet der Consent-Status –
 * das übernimmt Consent Mode v2 in GTM, daher hier kein zusätzlicher Block.
 */
export const track = (event: string, params: Record<string, unknown> = {}) => {
  if (!isTopWindow()) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
};

/**
 * Meta-Pixel-Event senden (nur im obersten Fenster). Der Pixel selbst wird in
 * index.html geladen und feuert – wie der PageView – unabhängig vom Cookie-Banner;
 * hier wird lediglich ein Standard-/Custom-Event nachgeschoben (z. B. „Lead").
 */
export const trackMeta = (event: string, params: Record<string, unknown> = {}) => {
  if (!isTopWindow() || typeof window.fbq !== "function") return;
  window.fbq("track", event, params);
};
