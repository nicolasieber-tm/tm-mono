import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";

/**
 * Handles in-page hash navigation with Lenis on desktop, falls back to
 * window.scrollTo on mobile/touch devices. Renders nothing.
 *
 * Place inside <BrowserRouter> so location updates are observable.
 */
export const HashScrollHandler = () => {
  const lenis = useLenis();
  const initialHashHandled = useRef(false);

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    if (window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    const computeYTop = (target: HTMLElement) => {
      const header = document.querySelector("header") as HTMLElement | null;
      const headerHeight = header?.offsetHeight ?? 80;
      return headerHeight;
    };

    const scrollToHash = () => {
      const hash = window.location.hash;
      if (!hash) return;
      const id = hash.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      const yTop = computeYTop(target);
      if (lenis) {
        lenis.scrollTo(target, {
          offset: -yTop,
          duration: 1.4,
          force: true,
          lock: true,
        });
      } else {
        const rect = target.getBoundingClientRect();
        window.scrollTo({ top: window.scrollY + rect.top - yTop, behavior: "smooth" });
      }
    };

    window.addEventListener("hashchange", scrollToHash);

    let cancelled = false;
    let correctionTimer: ReturnType<typeof setTimeout> | undefined;

    const runInitialScroll = async () => {
      if (initialHashHandled.current || !window.location.hash) return;
      window.scrollTo(0, 0);

      const fontsReady = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts
        ?.ready;
      if (fontsReady) {
        try {
          await fontsReady;
        } catch {
          /* ignore */
        }
      }
      if (cancelled) return;

      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (cancelled) return;

      scrollToHash();
      initialHashHandled.current = true;

      correctionTimer = setTimeout(() => {
        const hash = window.location.hash;
        if (!hash) return;
        const id = hash.slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        const yTop = computeYTop(target);
        const rect = target.getBoundingClientRect();
        const drift = Math.abs(rect.top - yTop);
        if (drift > 4) scrollToHash();
      }, 1200);
    };

    runInitialScroll();

    return () => {
      cancelled = true;
      if (correctionTimer) clearTimeout(correctionTimer);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, [lenis]);
  return null;
};
