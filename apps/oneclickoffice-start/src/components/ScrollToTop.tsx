import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Springt bei jedem Seitenwechsel an den Seitenanfang.
 *
 * Warum das nötig ist: Beim Wechsel innerhalb der App (Opt-in → /video) lädt
 * der Browser nichts neu und behält die Scroll-Position bei. Wer am Handy zum
 * Formular gescrollt hat, landet auf der Video-Seite deshalb mitten im Text —
 * ausgerechnet das Video und die Überschrift wären dann ausserhalb des Bildes.
 * Über den Link aus der E-Mail fällt es nicht auf, weil dort die Seite frisch
 * geladen wird.
 *
 * Drei Details, die hier wichtig sind:
 * 1. behavior "instant" — die Seite hat scroll-behavior: smooth, ohne diese
 *    Angabe würde der Sprung sichtbar durch die halbe Seite animieren.
 * 2. Bei "POP" (Zurück-Button) wird NICHT gescrollt: dort erwartet man, wieder
 *    an der verlassenen Stelle zu landen.
 * 3. scrollTop wird zusätzlich direkt gesetzt — ältere Safari-Versionen
 *    ignorieren window.scrollTo, wenn kurz zuvor overflow:hidden am body hing
 *    (genau der Fall, wenn sich das Opt-in-Overlay gerade geschlossen hat).
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "POP") return;

    try {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    } catch {
      window.scrollTo(0, 0);
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, navigationType]);

  return null;
};

export default ScrollToTop;
