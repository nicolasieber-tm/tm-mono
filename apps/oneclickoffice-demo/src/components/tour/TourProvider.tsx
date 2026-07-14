import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { tourSteps, type TourStep, type TourVariant } from "./tourSteps";

/**
 * TourProvider
 * ------------
 * Hält den Zustand der geführten Live-Demo-Tour (welche Variante, welcher
 * Schritt) und navigiert die App per react-router auf die Route des aktuellen
 * Schritts. Das Highlighting/Rendering übernimmt <TourOverlay/>.
 *
 * Gestartet wird die Tour von der Landingpage (Parent) per
 * postMessage({ type: "OCO_START_TOUR", variant }) an den iframe — oder per
 * `?tour=mobile|desktop` als Direktlink-Fallback. Same-origin, daher sicher.
 */

interface TourContextValue {
  active: boolean;
  variant: TourVariant | null;
  steps: TourStep[];
  stepIndex: number;
  currentStep: TourStep | null;
  isFirst: boolean;
  isLast: boolean;
  start: (variant: TourVariant) => void;
  next: () => void;
  prev: () => void;
  end: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

/**
 * Tour-Fortschritt an die einbettende Landingpage melden (same-origin).
 * Läuft die Demo nicht im iframe, gibt es kein Eltern-Fenster → kein Versand.
 * Die Landingpage (DemoShowcase) wandelt das in dataLayer-Events um.
 */
const postTourEvent = (
  name: "step" | "complete" | "abandon",
  variant: TourVariant,
  stepIndex: number,
) => {
  if (typeof window === "undefined" || window.parent === window) return;
  const steps = tourSteps[variant];
  window.parent.postMessage(
    {
      type: "OCO_TOUR_EVENT",
      name,
      variant,
      stepIndex: stepIndex + 1, // 1-basiert für die Auswertung
      stepTitle: steps[stepIndex]?.title ?? null,
      totalSteps: steps.length,
    },
    window.location.origin,
  );
};

export const useTour = (): TourContextValue => {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within TourProvider");
  return ctx;
};

export const TourProvider = ({ children }: { children: ReactNode }) => {
  const [variant, setVariant] = useState<TourVariant | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const steps = variant ? tourSteps[variant] : [];
  const active = variant !== null;
  const currentStep = active ? steps[stepIndex] ?? null : null;
  const isFirst = stepIndex === 0;
  const isLast = active ? stepIndex === steps.length - 1 : false;

  const start = useCallback((v: TourVariant) => {
    setStepIndex(0);
    setVariant(v);
  }, []);

  const reset = useCallback(() => {
    setVariant(null);
    setStepIndex(0);
  }, []);

  // Vom Nutzer geschlossen (X / „Tour beenden") → Abbruch beim aktuellen Schritt.
  const end = useCallback(() => {
    if (variant) postTourEvent("abandon", variant, stepIndex);
    reset();
  }, [variant, stepIndex, reset]);

  const next = useCallback(() => {
    if (!variant) return;
    if (stepIndex >= tourSteps[variant].length - 1) {
      postTourEvent("complete", variant, stepIndex); // letzter Schritt → durchgeklickt
      reset();
    } else {
      setStepIndex((i) => i + 1);
    }
  }, [variant, stepIndex, reset]);

  // Jeden angezeigten Schritt melden (Schritt 1 … n).
  useEffect(() => {
    if (!variant) return;
    postTourEvent("step", variant, stepIndex);
  }, [variant, stepIndex]);

  const prev = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  // Start-Signal von der Landingpage (postMessage, nur im eingebetteten iframe).
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const data = e.data;
      if (
        data &&
        data.type === "OCO_START_TOUR" &&
        (data.variant === "mobile" || data.variant === "desktop")
      ) {
        start(data.variant);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [start]);

  // URL-Param `?tour=mobile|desktop` — startet die Tour auch bei client-seitiger
  // Navigation (z. B. Landing-Button „Geführte Demo starten"), nicht nur beim
  // Erstladen. Ref-Guard: pro App-Leben nur EINMAL auto-starten, damit die Tour
  // nach dem Beenden nicht sofort neu startet, falls der Param noch in der URL steht.
  const tourParamConsumed = useRef(false);
  useEffect(() => {
    if (tourParamConsumed.current) return;
    const param = new URLSearchParams(location.search).get("tour");
    if (param === "mobile" || param === "desktop") {
      tourParamConsumed.current = true;
      start(param);
    }
  }, [location.search, start]);

  // Vor jedem Schritt auf die richtige Route navigieren (kein Reload). replace
  // statt push: die Tour-Schritte sollen den Browser-Verlauf nicht zumüllen —
  // so führt „Zurück" aus der Demo direkt auf die Landing statt Schritt für Schritt.
  //
  // Verlässt der Nutzer die Demo (Location NICHT mehr eine der Tour-Routen, z. B.
  // per Browser-Back auf die Landing), wird die Tour BEENDET statt ihn in den
  // Schritt zurückzuziehen — sonst „schnappt" der native Zurück-Weg zurück in die
  // Demo (Tour-Drag) und der Besucher sitzt fest.
  useEffect(() => {
    if (!active || !currentStep) return;
    if (location.pathname === currentStep.route) return;
    const inDemo = steps.some((s) => s.route === location.pathname);
    if (!inDemo) {
      end();
      return;
    }
    navigate(currentStep.route, { replace: true });
  }, [active, currentStep, location.pathname, navigate, steps, end]);

  return (
    <TourContext.Provider
      value={{
        active,
        variant,
        steps,
        stepIndex,
        currentStep,
        isFirst,
        isLast,
        start,
        next,
        prev,
        end,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};
