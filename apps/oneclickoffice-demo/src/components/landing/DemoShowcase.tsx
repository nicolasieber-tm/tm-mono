import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { demo } from "@/lib/landing-content";

// Viewport-Breite des LP-Besuchers → entscheidet, welches Demo-Mockup wir zeigen.
const useIsMobileViewport = () => {
  const query = "(max-width: 767px)";
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
};

const DemoShowcase = () => {
  const isMobile = useIsMobileViewport();
  const [active, setActive] = useState(false); // Interaktion erst nach Klick (kein Scroll-Trap)
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const src = isMobile ? demo.mobileSrc : demo.desktopSrc;

  // Beim Gerätewechsel (z. B. Rotation) Interaktion zurücksetzen.
  useEffect(() => {
    setActive(false);
  }, [isMobile]);

  const restart = () => {
    if (iframeRef.current) iframeRef.current.src = src;
  };

  // Startet die geführte Tour in der eingebetteten Demo (same-origin postMessage).
  // Variante hängt am Viewport: Handy = Erfassen-Tour, Desktop = Abrechnen-Tour.
  const startTour = () => {
    setActive(true);
    iframeRef.current?.contentWindow?.postMessage(
      { type: "OCO_START_TOUR", variant: isMobile ? "mobile" : "desktop" },
      window.location.origin,
    );
  };

  // Gemeinsamer iframe + Start-Overlay, vom jeweiligen Mockup umrahmt.
  const frame = (
    <div className="relative h-full w-full">
      <iframe
        ref={iframeRef}
        src={src}
        title="OneClick Office Live-Demo"
        loading="lazy"
        className="block h-full w-full bg-white"
        style={{ pointerEvents: active ? "auto" : "none" }}
      />
      {!active && (
        <button
          type="button"
          onClick={startTour}
          aria-label={demo.activateLabel}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-slate-900/35 backdrop-blur-[1px] transition-colors hover:bg-slate-900/45"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-2xl transition-transform hover:scale-110">
            <Play className="ml-1 h-7 w-7 fill-accent text-accent" />
          </span>
          <span className="rounded-full bg-white/95 px-4 py-1.5 text-sm font-semibold text-text-primary shadow-lg">
            {demo.activateLabel}
          </span>
        </button>
      )}
    </div>
  );

  return (
    <section id="demo" className="section-padding py-12 md:py-20">
      <div className="section-container text-center">
        <ScrollReveal>
          <span className="mb-6 inline-block rounded-full bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent-deep">
            {demo.kicker}
          </span>
          <h2 className="headline-h2 mb-4 text-text-primary">{demo.headline}</h2>
          <p className="body-large mx-auto mb-10 max-w-[640px]">
            {isMobile ? demo.subheadlineMobile : demo.subheadlineDesktop}
          </p>
        </ScrollReveal>
      </div>

      {/* Mockup in eigenem, breiterem Wrapper — bricht aus dem 1200px-Container
          aus, damit die Desktop-App genug Platz hat und Inhalte (z. B. der
          "Rechnungen generieren"-Bereich) nicht gestaucht wirken. */}
      <div className="mx-auto w-full max-w-[1360px]">
        <ScrollReveal delay={0.1}>
          {isMobile ? (
            // Phone-Mockup
            <div className="relative mx-auto w-full max-w-[380px] rounded-[2.6rem] bg-slate-900 p-2.5 shadow-2xl shadow-slate-400/50">
              <div className="mx-auto mb-2 mt-1 h-1.5 w-16 rounded-full bg-slate-700" />
              <div className="h-[640px] overflow-hidden rounded-[1.9rem]">{frame}</div>
            </div>
          ) : (
            // Browser-Mockup
            <div className="mx-auto max-w-[1360px] overflow-hidden rounded-2xl border border-border bg-white shadow-2xl shadow-slate-300/50">
              <div className="flex items-center gap-2 border-b border-border bg-bg-elevated px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <div className="mx-auto max-w-md flex-1 rounded-md border border-border bg-white px-3 py-1 text-center text-xs text-text-muted">
                  {demo.browserUrl}
                </div>
              </div>
              <div className="h-[560px] md:h-[720px]">{frame}</div>
            </div>
          )}
        </ScrollReveal>
      </div>

      <div className="section-container text-center">
        <ScrollReveal delay={0.15}>
          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-sm text-text-muted">{demo.hint}</p>
            {active && (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                <button
                  type="button"
                  onClick={startTour}
                  className="inline-flex items-center gap-2 text-sm font-medium text-accent-deep hover:underline"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Tour erneut starten
                </button>
                <button
                  type="button"
                  onClick={restart}
                  className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:underline"
                >
                  <RotateCcw className="h-4 w-4" />
                  Demo zurücksetzen
                </button>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default DemoShowcase;
