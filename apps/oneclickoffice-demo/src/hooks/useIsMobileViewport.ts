import { useEffect, useState } from "react";

/**
 * Gemeinsame Viewport-Weiche der Landingpage: entscheidet zwischen Mobile- und
 * Desktop-Variante (Hero, Live-Demo, Optin). Der Breakpoint ist identisch zur
 * eingebetteten Live-Demo, damit alle Sections beim selben Punkt umschalten.
 *
 * Wichtig: Der Startwert wird synchron aus matchMedia gelesen (kein Flackern
 * Desktop → Mobile beim ersten Render).
 */
const QUERY = "(max-width: 767px)";

export const useIsMobileViewport = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia(QUERY).matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
};
