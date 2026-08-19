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
 * Funnel-Event in den dataLayer schreiben. Ob daraus ein voller oder ein
 * cookieloser GA4-Hit wird, entscheidet Consent Mode v2 in GTM — deshalb hier
 * bewusst kein zusätzlicher Block.
 */
export const track = (event: string, params: Record<string, unknown> = {}) => {
  if (!isBrowser) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
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
