import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useLenis } from "lenis/react";
import { useEffect, useRef } from "react";
import { SmoothScroll } from "@tm/motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Anfrage from "./pages/Anfrage.tsx";
import Impressum from "./pages/Impressum.tsx";
import Datenschutz from "./pages/Datenschutz.tsx";

const queryClient = new QueryClient();

const HashScrollHandlerLenis = () => {
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
    const computeYTop = (target: HTMLElement, isEarlyAccess: boolean) => {
      const header = document.querySelector("header") as HTMLElement | null;
      const headerHeight = header?.offsetHeight ?? 80;
      if (!isEarlyAccess) return headerHeight;
      const viewportHeight = window.innerHeight;
      const elementHeight = target.offsetHeight;
      const centerYTop = (viewportHeight - elementHeight) / 2;
      return Math.max(headerHeight + 24, centerYTop);
    };

    const scrollToHash = () => {
      const hash = window.location.hash;
      if (!hash) return;
      const id = hash.slice(1);
      const isEarlyAccess = id === "early-access";
      const target =
        (isEarlyAccess && document.getElementById("early-access-content")) ||
        document.getElementById(id);
      if (!target) return;
      const yTop = computeYTop(target, isEarlyAccess);
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

      // After framer-motion reveals settle, recompute and correct if drifted.
      correctionTimer = setTimeout(() => {
        const hash = window.location.hash;
        if (!hash) return;
        const id = hash.slice(1);
        const isEarlyAccess = id === "early-access";
        const target =
          (isEarlyAccess && document.getElementById("early-access-content")) ||
          document.getElementById(id);
        if (!target) return;
        const yTop = computeYTop(target, isEarlyAccess);
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

const Routing = () => (
  <BrowserRouter>
    <HashScrollHandlerLenis />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/anfrage" element={<Anfrage />} />
      <Route path="/impressum" element={<Impressum />} />
      <Route path="/datenschutz" element={<Datenschutz />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SmoothScroll>
          <Routing />
        </SmoothScroll>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
