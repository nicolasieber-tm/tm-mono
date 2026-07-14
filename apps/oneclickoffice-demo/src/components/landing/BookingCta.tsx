import { useEffect } from "react";
import { CalendarCheck } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { track } from "@/lib/analytics";

// Trending-Media-Buchungs-Widget für OneClick Office. Eigene Widget-ID; das
// Script bindet per Event-Delegation alle CTAs mit href="#book-widget" ein
// (auch den Mobile-Hero-Button). data-no-fab: kein schwebender Button, nur
// unsere expliziten CTAs öffnen das Overlay.
const OCO_BOOKING_WIDGET_ID = "f34ac97e-fd08-43b9-bd4e-3c1f06cef5f0";

// Mobile-Conversion (ersetzt auf Mobile das Opt-in-Formular): direktes Buchen
// eines kostenlosen Erstgesprächs. Das Widget-Script wird deferred nachgeladen,
// damit der LCP der Landing geschützt bleibt (kein Render-Blocking).
const BookingCta = () => {
  useEffect(() => {
    // Nur einmal laden (Guard gegen Doppel-Injektion bei Remounts/Viewport-Wechsel).
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
    <section id="termin" className="section-padding py-12">
      <div className="section-container max-w-[560px]">
        <ScrollReveal>
          <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-xl shadow-slate-200/60 md:p-8">
            <span className="mb-6 inline-block rounded-full bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent-deep">
              Kostenloses Erstgespräch
            </span>
            <h2 className="headline-h2 mb-3 text-text-primary">
              Wir sehen uns OneClick Office an deinem Fall an.
            </h2>
            <p className="body-large mx-auto mb-7 max-w-[440px]">
              In rund 20 Minuten zeigen wir dir, wie du deine Abrechnung mit OneClick Office
              vereinfachst – unverbindlich und kostenlos.
            </p>
            <a
              href="#book-widget"
              onClick={() =>
                track("cta_click", { cta_id: "mobile_booking", cta_label: "Kostenloses Erstgespräch buchen" })
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-8 py-4 text-lg font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:bg-accent-deep"
            >
              <CalendarCheck className="h-5 w-5" />
              Kostenloses Erstgespräch buchen
            </a>
            <p className="mt-4 text-sm text-text-muted">Unverbindlich · in wenigen Minuten gebucht</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default BookingCta;
