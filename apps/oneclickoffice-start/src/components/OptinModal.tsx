import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { meldeOverlay } from "@/lib/analytics";

/**
 * Formular-Overlay.
 *
 * Bewusst selbst gebaut statt per Dialog-Library: die Seite kommt sonst mit
 * vier Abhängigkeiten aus, und das hier ist überschaubar. Was ein Dialog
 * trotzdem können muss, ist alles enthalten:
 *   - Escape schliesst, Klick auf den Hintergrund ebenfalls
 *   - der Seiteninhalt dahinter scrollt nicht mit
 *   - der Tastaturfokus bleibt im Overlay gefangen
 *   - beim Schliessen kehrt der Fokus dorthin zurück, wo er herkam
 */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

const OptinModal = ({ open, onClose, children }: Props) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  /* Dem Cookie-Banner melden, dass ein Overlay im Weg liegt: Es klebt unten am
     Fenster und läge auf dem Handy sonst genau über dem Absende-Button. */
  useEffect(() => {
    meldeOverlay(open);
    return () => meldeOverlay(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    restoreFocusTo.current = document.activeElement as HTMLElement | null;

    // Hintergrund festhalten. scrollbarWidth ausgleichen, damit die Seite beim
    // Öffnen nicht seitlich springt.
    const { body } = document;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    // Am Desktop direkt ins erste Feld. Am Handy NICHT: dort würde die Tastatur
    // sofort aufspringen und das halbe Overlay verdecken.
    const timer = window.setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      if (window.matchMedia("(min-width: 768px)").matches) {
        panel.querySelector<HTMLElement>("input")?.focus();
      } else {
        panel.focus();
      }
    }, 80);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;

      // Fokus zurückgeben, aber ohne zu scrollen: Schliesst sich das Overlay
      // durch einen Seitenwechsel (Absenden → /video), zeigt der gemerkte
      // Fokus auf ein Element der alten Seite. Ein normales focus() würde den
      // Browser dorthin scrollen und die neue Seite mitten im Text beginnen
      // lassen. preventScroll behält die Tastaturbedienung, ohne das
      // auszulösen; zusätzlich nur fokussieren, wenn das Element noch da ist.
      const zurueck = restoreFocusTo.current;
      if (zurueck && document.contains(zurueck)) {
        zurueck.focus({ preventScroll: true });
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-end justify-center overflow-y-auto bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(e) => {
        // Nur schliessen, wenn wirklich der Hintergrund geklickt wurde — nicht,
        // wenn eine Textauswahl im Panel endet.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="optin-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-[460px] rounded-t-2xl bg-white p-6 shadow-2xl outline-none animate-fade-up sm:rounded-2xl sm:p-7"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Schliessen"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-muted hover:text-text-primary"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default OptinModal;
