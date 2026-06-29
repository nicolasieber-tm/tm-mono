import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTour } from "./TourProvider";

/**
 * TourOverlay
 * -----------
 * Rendert den Spotlight (Dimmer mit „Loch" über dem Ziel) und die Tour-Karte.
 *
 * Wichtig: Das gesamte Overlay wird per Portal direkt in document.body gerendert
 * und mit `position: fixed` + Viewport-Koordinaten platziert. So sind Spotlight
 * und Karte unabhängig von Positionierungs-/Transform-Kontexten der App und
 * sitzen exakt dort, wo getBoundingClientRect() das Ziel meldet.
 */

const HOLE_PADDING = 8;

const TourOverlay = () => {
  const { active, currentStep, stepIndex, steps, isFirst, isLast, next, prev, end } = useTour();
  const [rect, setRect] = useState<DOMRect | null>(null);

  const target = currentStep?.target ?? null;

  // Ziel finden (mit Retry, falls die Route gerade erst gewechselt hat) und in
  // den Blick scrollen. Bei bereits sichtbaren (z. B. fixierten) Elementen
  // scrollt "nearest" nicht unnötig.
  useEffect(() => {
    if (!active || !target) {
      setRect(null);
      return;
    }
    let raf = 0;
    let tries = 0;
    const locate = () => {
      const el = document.querySelector(target);
      if (el) {
        // Ziel mittig scrollen, damit die Tour-Karte (am oberen/unteren Rand)
        // den hervorgehobenen Bereich nicht verdeckt.
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        setRect(el.getBoundingClientRect());
      } else if (tries < 90) {
        tries += 1;
        raf = requestAnimationFrame(locate);
      } else {
        setRect(null);
      }
    };
    raf = requestAnimationFrame(locate);
    return () => cancelAnimationFrame(raf);
  }, [active, target, stepIndex]);

  // Dem Ziel bei Scroll/Resize/Layout-Verschiebungen folgen.
  useEffect(() => {
    if (!active || !target) return;
    const update = () => {
      const el = document.querySelector(target);
      if (el) setRect(el.getBoundingClientRect());
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    const interval = window.setInterval(update, 200);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      window.clearInterval(interval);
    };
  }, [active, target, stepIndex]);

  if (!active || !currentStep) return null;

  const hole =
    rect && rect.width > 0
      ? {
          top: rect.top - HOLE_PADDING,
          left: rect.left - HOLE_PADDING,
          width: rect.width + HOLE_PADDING * 2,
          height: rect.height + HOLE_PADDING * 2,
        }
      : null;

  // Karte unten — außer das Ziel liegt im unteren Bereich, dann nach oben.
  // Ohne Ziel (Intro/Abschluss) zentriert.
  const cardAtTop = hole !== null && rect !== null && rect.bottom > window.innerHeight * 0.62;
  const cardVertical: CSSProperties = !hole
    ? { top: "50%", transform: "translateY(-50%)" }
    : cardAtTop
      ? { top: "1rem" }
      : { bottom: "1rem" };

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
      {/* Dimmer + Spotlight (Viewport-Koordinaten via fixed) */}
      {hole ? (
        <div
          style={{
            position: "fixed",
            top: hole.top,
            left: hole.left,
            width: hole.width,
            height: hole.height,
            boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.55)",
            outline: "2px solid rgba(255, 255, 255, 0.9)",
            outlineOffset: "2px",
            borderRadius: "16px",
            pointerEvents: "none",
            transition: "all 0.3s ease-out",
          }}
        />
      ) : (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Tour-Karte */}
      <div
        className="pointer-events-auto rounded-2xl border border-border bg-background p-5 shadow-2xl"
        style={{
          position: "fixed",
          left: "0.75rem",
          right: "0.75rem",
          maxWidth: "440px",
          marginInline: "auto",
          ...cardVertical,
        }}
      >
        <button
          type="button"
          onClick={end}
          aria-label="Tour beenden"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          Schritt {stepIndex + 1} / {steps.length}
        </p>
        <h3 className="mb-2 pr-6 text-lg font-bold text-foreground">{currentStep.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{currentStep.body}</p>

        {/* Fortschrittspunkte */}
        <div className="mt-4 flex items-center gap-1.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === stepIndex ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={end}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Tour beenden
          </button>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <Button variant="outline" size="sm" onClick={prev}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Zurück
              </Button>
            )}
            <Button size="sm" onClick={next}>
              {isLast ? (
                <>
                  Fertig
                  <Check className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  Weiter
                  <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default TourOverlay;
