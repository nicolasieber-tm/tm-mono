/**
 * Angaben für die Meta Conversions API, die nur im Browser verfügbar sind.
 *
 * Hintergrund: Die Conversion wird zweimal an Meta gemeldet — einmal vom
 * Browser-Pixel, einmal vom Server (weil der Pixel bei vielen Besuchern
 * blockiert wird). Damit Meta daraus EIN Ereignis macht statt zwei, brauchen
 * beide Meldungen dieselbe Kennung. Und damit Meta die Conversion überhaupt
 * einer Person und einer Anzeige zuordnen kann, helfen ein paar Angaben, die
 * der Datenbank-Trigger später nicht mehr hat.
 */

/** Gemeinsame Ereignis-Kennung für Pixel und Server. */
export const neueEventId = (): string => {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch {
    /* fällt unten durch */
  }
  return `ev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const cookie = (name: string): string | null => {
  try {
    const treffer = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
    return treffer ? decodeURIComponent(treffer[2]) : null;
  } catch {
    return null;
  }
};

/**
 * Die Facebook-Klick-ID. Steht als `fbclid` in der URL, wenn jemand über eine
 * Anzeige kommt. Meta erwartet sie im Format `fb.1.<zeitstempel>.<fbclid>`.
 * Das vom Pixel gesetzte `_fbc`-Cookie hat Vorrang; fehlt es (etwa weil der
 * Pixel blockiert wurde), bauen wir den Wert selbst aus der URL.
 */
const klickId = (): string | null => {
  const ausCookie = cookie("_fbc");
  if (ausCookie) return ausCookie;
  try {
    const fbclid =
      new URLSearchParams(window.location.search).get("fbclid") ??
      JSON.parse(sessionStorage.getItem("oco_utm") ?? "{}").fbclid;
    return fbclid ? `fb.1.${Date.now()}.${fbclid}` : null;
  } catch {
    return null;
  }
};

export type MetaContext = {
  user_agent?: string;
  fbc?: string;
  fbp?: string;
  event_source_url?: string;
};

/** Sammelt, was für eine gute Zuordnung hilft. Alles davon ist optional. */
export const metaContext = (): MetaContext => {
  if (typeof window === "undefined") return {};
  const ctx: MetaContext = {
    user_agent: navigator.userAgent,
    event_source_url: window.location.href.split("#")[0],
  };
  const fbc = klickId();
  if (fbc) ctx.fbc = fbc;
  // Vom Pixel gesetzte Browser-Kennung. Fehlt, wenn der Pixel blockiert wurde.
  const fbp = cookie("_fbp");
  if (fbp) ctx.fbp = fbp;
  return ctx;
};
