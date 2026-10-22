/* =================================================================
   Terminbuchungs-Widget (timetracking.trendingmedia.ch/booking-embed.js)

   Das Embed-Script ist pro Widget-ID gedacht und hängt beim Laden einen
   globalen Klick-Listener an (Trigger: [data-book-widget] bzw. #book-widget).
   Lädt man es in der SPA beim Seitenwechsel für eine zweite ID nochmals,
   reagieren beide Instanzen auf jeden Klick. Deshalb:

   - jedes Script (= jede ID) wird höchstens einmal geladen und danach nie
     entfernt; seine `window.TMBook`-Instanz merken wir uns pro ID
   - die Seite benutzt eigene Trigger ([data-book] bzw. href="#termin"), auf
     die das Script selbst nicht reagiert; SiteLayout leitet sie an die
     Widget-ID der aktuellen Seite weiter
   ================================================================= */

/** Standard-Widget (Erstgespräch Trending Media) */
export const WIDGET_TM = "ebf5635f-f65f-4758-a8d5-e5fb4a791a4b";
/** Widget der Landingpages-Seite (eigene Vorqualifizierungs-Fragen) */
export const WIDGET_WEB = "333c239f-7b64-433b-9f5e-d6526c46891a";

/** Anker für Buchungs-Buttons: <a href={BOOK_HREF}> öffnet das Widget der Seite */
export const BOOK_HREF = "#termin";

type TMBook = { open: () => void; close: () => void };
declare global {
  interface Window { TMBook?: TMBook }
}

const instances = new Map<string, Promise<TMBook>>();

export function loadBooking(widgetId: string): Promise<TMBook> {
  const known = instances.get(widgetId);
  if (known) return known;
  const p = new Promise<TMBook>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://timetracking.trendingmedia.ch/booking-embed.js";
    s.setAttribute("data-widget-id", widgetId);
    s.setAttribute("data-no-fab", "");
    s.async = true;
    // window.TMBook wird beim Ausführen gesetzt; onload feuert direkt danach
    s.onload = () => (window.TMBook ? resolve(window.TMBook) : reject(new Error("TMBook fehlt")));
    s.onerror = () => { instances.delete(widgetId); reject(new Error("booking-embed.js nicht geladen")); };
    document.body.appendChild(s);
  });
  instances.set(widgetId, p);
  return p;
}

export function openBooking(widgetId: string) {
  loadBooking(widgetId).then((b) => b.open()).catch(() => {
    window.location.href = "mailto:info@trendingmedia.ch?subject=Erstgespr%C3%A4ch";
  });
}
