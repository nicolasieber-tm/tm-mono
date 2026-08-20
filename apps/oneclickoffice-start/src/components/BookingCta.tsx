import { useEffect } from "react";
import { CalendarCheck } from "lucide-react";
import { video } from "@/lib/content";
import { track } from "@/lib/analytics";
import ScrollReveal from "./ScrollReveal";

// Eigene Widget-ID dieser Kampagne (nicht die der Demo-Seite) — so lassen sich
// die Buchungen den Funneln zuordnen.
const OCO_BOOKING_WIDGET_ID = "9ac37dbb-e0fc-4ea4-89c4-3183c7d4ece4";

const BOOKING_ORIGIN = "https://timetracking.trendingmedia.ch";

/**
 * Ausweichziel für die Buchungs-Buttons.
 *
 * Warum das nötig ist: Die Buttons hingen vorher an `href="#book-widget"` —
 * einem Anker, den es im Dokument gar nicht gibt. Er ist reiner Aufhänger für
 * das Einbett-Skript, das Klicks abfängt. Kommt dieses Skript nicht durch (ein
 * Inhaltsblocker genügt, und der Hostname trägt „tracking" im Namen), passiert
 * beim Klick schlicht nichts: kein Overlay, keine Meldung, kein zweiter Weg zur
 * Buchung.
 *
 * Mit einer echten Adresse im href und `data-book-widget` am Element greifen
 * beide Fälle: Ist das Skript da, erkennt es das Attribut, unterdrückt den Link
 * und öffnet das Overlay. Fehlt es, folgt der Browser einfach dem Link.
 */
export const BOOKING_FALLBACK_URL = `${BOOKING_ORIGIN}/book-widget/${OCO_BOOKING_WIDGET_ID}`;

/**
 * Terminbuchung über das Trending-Media-Widget. Das Skript fängt Klicks auf
 * alles ab, was `data-book-widget` trägt (oder auf „#book-widget" zeigt).
 * data-no-fab unterdrückt den schwebenden Button; öffnen soll nur unser
 * eigener CTA. Zum Ausweichziel im href siehe BOOKING_FALLBACK_URL.
 *
 * Das Script wird bewusst erst per useEffect nachgeladen, damit es den ersten
 * Seitenaufbau nicht blockiert.
 */
const BookingCta = () => {
  useEffect(() => {
    // Guard gegen doppeltes Einhängen bei Remounts.
    if (document.querySelector('script[data-booking-embed="oco"]')) return;
    const s = document.createElement("script");
    s.src = `${BOOKING_ORIGIN}/booking-embed.js`;
    s.setAttribute("data-widget-id", OCO_BOOKING_WIDGET_ID);
    s.setAttribute("data-no-fab", "");
    s.setAttribute("data-booking-embed", "oco");
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return (
    <section id="termin" className="py-14 md:py-20">
      <div className="section-container max-w-[620px]">
        <ScrollReveal>
          <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-xl shadow-slate-200/60 md:p-9">
            <span className="lp-kicker">{video.booking.kicker}</span>
            <h2 className="headline-h2 mt-5">{video.booking.headline}</h2>
            <p className="body-large mx-auto mt-3 max-w-[460px]">
              {video.booking.subheadline}
            </p>
            <a
              href={BOOKING_FALLBACK_URL}
              data-book-widget
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                track("cta_click", { cta_id: "booking", cta_label: video.booking.cta })
              }
              className="btn-primary mt-7"
            >
              <CalendarCheck className="h-5 w-5" />
              {video.booking.cta}
            </a>
            <p className="mt-4 text-sm text-text-muted">{video.booking.note}</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default BookingCta;
