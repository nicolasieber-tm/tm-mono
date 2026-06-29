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

/**
 * Zielelement mittig in den Blick holen – aber NUR innerhalb des iframes.
 *
 * `Element.scrollIntoView()` scrollt alle Scroll-Container der Vorfahrenkette,
 * und das schließt – weil die Demo in einem iframe läuft – auch die Eltern-
 * Landingpage mit ein. Dadurch springt beim „Weiter" die ganze Seite. Wir
 * scrollen deshalb selbst: entweder den nächsten verschachtelten Scroll-
 * Container oder das iframe-eigene Fenster, niemals `window.parent`.
 */
const centerInFrame = (el: Element) => {
  const win = el.ownerDocument.defaultView;
  if (!win) return;

  // Fixierte/sticky Elemente (z. B. die Bottom-Navigation) sind ohnehin immer
  // sichtbar – Scrollen würde sie nicht bewegen, nur unnötig ruckeln.
  if (win.getComputedStyle(el).position === "fixed") return;

  const doc = el.ownerDocument;
  const isScrollable = (node: Element) => {
    const oy = win.getComputedStyle(node).overflowY;
    return (oy === "auto" || oy === "scroll" || oy === "overlay") && node.scrollHeight > node.clientHeight + 1;
  };

  // Nächsten scrollbaren Vorfahren INNERHALB des iframes suchen.
  let scroller: Element | null = el.parentElement;
  while (
    scroller &&
    scroller !== doc.body &&
    scroller !== doc.documentElement &&
    !isScrollable(scroller)
  ) {
    scroller = scroller.parentElement;
  }

  const er = el.getBoundingClientRect();
  if (scroller && scroller !== doc.body && scroller !== doc.documentElement) {
    // Verschachtelter Container: nur ihn scrollen.
    const cr = scroller.getBoundingClientRect();
    const delta = er.top - cr.top - (scroller.clientHeight - er.height) / 2;
    scroller.scrollTo({ top: scroller.scrollTop + delta, behavior: "smooth" });
  } else {
    // Dokument-Ebene des iframes (nicht das Elternfenster!).
    const top = win.scrollY + er.top - (win.innerHeight - er.height) / 2;
    win.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }
};

const TourOverlay = () => {
  const { active, currentStep, stepIndex, steps, isFirst, isLast, next, prev, end } = useTour();
  const [rect, setRect] = useState<DOMRect | null>(null);
  // Der Spotlight startet unsichtbar und blendet erst ein, wenn er an seinem
  // Ziel ruhig sitzt. So „wandert" er beim Schrittwechsel nie von der vorigen
  // Position herüber, sondern erscheint einfach dort, wo er hingehört.
  const [visible, setVisible] = useState(false);

  const target = currentStep?.target ?? null;

  // Ziel finden (mit Retry, falls die Route gerade erst gewechselt hat),
  // mittig scrollen und – sobald die Position ruhig ist – sanft einblenden.
  useEffect(() => {
    if (!active || !target) {
      setRect(null);
      setVisible(false);
      return;
    }
    // Beim Schrittwechsel zuerst ausblenden (snappt sofort auf 0, kein
    // Herauswandern), dann am neuen Ziel ruhig einblenden.
    setVisible(false);

    let raf = 0;
    let tries = 0; // Versuche, das (evtl. erst mountende) Ziel zu finden
    let frames = 0; // Frames seit gefunden – Obergrenze fürs Warten aufs Scroll-Ende
    let scrolled = false;
    let last: { top: number; left: number } | null = null;
    let stable = 0;

    const locate = () => {
      const el = document.querySelector(target);
      if (!el) {
        if (tries < 90) {
          tries += 1;
          raf = requestAnimationFrame(locate);
        } else {
          setRect(null);
        }
        return;
      }
      // Einmalig mittig scrollen (nur im iframe), damit die Tour-Karte (am
      // oberen/unteren Rand) den hervorgehobenen Bereich nicht verdeckt.
      if (!scrolled) {
        centerInFrame(el);
        scrolled = true;
      }
      // Position schon (unsichtbar) setzen, damit beim Einblenden alles sitzt.
      const r = el.getBoundingClientRect();
      setRect(r);
      // Warten, bis das Smooth-Scrolling die Position nicht mehr verschiebt.
      const settled =
        last !== null && Math.abs(r.top - last.top) < 0.5 && Math.abs(r.left - last.left) < 0.5;
      stable = settled ? stable + 1 : 0;
      last = { top: r.top, left: r.left };
      frames += 1;
      if (stable >= 2 || frames > 90) {
        setVisible(true); // angekommen → sanft einblenden
        return;
      }
      raf = requestAnimationFrame(locate);
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
            // Nur die Deckkraft wird animiert – die Position niemals. Dadurch
            // erscheint der Rahmen einfach, statt von der Seite hereinzugleiten.
            opacity: visible ? 1 : 0,
            transition: visible ? "opacity 0.25s ease-out" : "none",
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
