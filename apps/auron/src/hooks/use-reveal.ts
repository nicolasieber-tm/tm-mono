import { useEffect, useState } from "react";

export type RevealProps = {
  initial: { opacity: number; y?: number };
  whileInView: { opacity: number; y: number };
  viewport: { once: boolean; margin?: string };
  transition: { duration: number; delay?: number; ease?: [number, number, number, number] };
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function useReveal() {
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const sync = () => {
      setIsMobile(window.matchMedia("(max-width: 767px)").matches);
      setPrefersReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const reveal = (delay = 0, yDesktop = 30): RevealProps => {
    if (prefersReduced) {
      return {
        initial: { opacity: 1, y: 0 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0 },
      };
    }
    if (isMobile) {
      return {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "0px 0px -8% 0px" },
        transition: { duration: 0.7, delay: Math.min(delay, 0.18), ease: EASE },
      };
    }
    return {
      initial: { opacity: 0, y: yDesktop },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "0px 0px -15% 0px" },
      transition: { duration: 0.6, delay, ease: EASE },
    };
  };

  return { reveal, isMobile, prefersReduced };
}
