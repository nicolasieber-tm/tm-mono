import { useEffect } from "react";
import { CalendarCheck } from "lucide-react";
import { video } from "@/lib/content";
import { track } from "@/lib/analytics";
import ScrollReveal from "./ScrollReveal";

/**
 * Terminbuchung über das Trending-Media-Widget — dieselbe Widget-ID, die schon
 * auf der Demo-Landing im Einsatz ist. Das Script bindet per Event-Delegation
 * alle Links mit href="#book-widget" ein. data-no-fab unterdrückt den
 * schwebenden Button; öffnen soll nur unser eigener CTA.
 *
 * Das Script wird bewusst erst per useEffect nachgeladen, damit es den ersten
 * Seitenaufbau nicht blockiert.
 */
const OCO_BOOKING_WIDGET_ID = "f34ac97e-fd08-43b9-bd4e-3c1f06cef5f0";

const BookingCta = () => {
  useEffect(() => {
    // Guard gegen doppeltes Einhängen bei Remounts.
    if (document.querySelector('script[data-booking-embed="oco"]')) return;
    const s = document.createElement("script");
    s.src = "https://timetracking.trendingmedia.ch/booking-embed.js";
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
              href="#book-widget"
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
