import { useEffect, useRef, useState, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Verzögerung in Sekunden. */
  delay?: number;
}

/**
 * Leichtes Scroll-Reveal per IntersectionObserver — bewusst ohne framer-motion
 * (die Lib wäre auf dieser Seite der grösste einzelne Brocken im Bundle).
 * Läuft einmalig und respektiert prefers-reduced-motion.
 */
const ScrollReveal = ({ children, className = "", delay = 0 }: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "-60px" },
    );

    observer.observe(el);

    // Sicherheitsnetz: Der Inhalt wird nach spätestens 1,5 Sekunden sichtbar,
    // auch wenn der Observer nie meldet. Auf einer Kampagnenseite darf kein
    // Text davon abhängen, dass eine Animation zuverlässig auslöst — im
    // Zweifel lieber ohne Effekt anzeigen als gar nicht.
    const failsafe = window.setTimeout(() => {
      setVisible(true);
      observer.disconnect();
    }, 1500);

    return () => {
      window.clearTimeout(failsafe);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
        transitionDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
