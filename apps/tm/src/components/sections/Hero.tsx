import { useEffect, useRef, useState } from "react";
import { CAL_URL } from "@/lib/links";
import { useSectionMode, modeToClass } from "@/lib/theme";

const ROLES = ["Software", "KI", "Automationen", "Prozesse", "Landingpages"];

const NAV = [
  { label: "Leistungen", href: "#leistungen" },
  { label: "Vorgehen", href: "#vorgehen" },
  { label: "Produkte", href: "#produkte" },
  { label: "FAQ", href: "#faq" },
];

const GRID_W = 1600;
const GRID_H = 900;
const GRID_STEP = 60;
const GRID_SEG = 16;

const WavyGrid = () => {
  const linesRef = useRef<(SVGPathElement | null)[]>([]);
  const rows = Math.floor(GRID_H / GRID_STEP) + 1;
  const cols = Math.floor(GRID_W / GRID_STEP) + 1;

  useEffect(() => {
    let raf = 0;
    const start = performance.now();

    const tick = () => {
      const t = (performance.now() - start) / 1000;
      for (let r = 0; r < rows; r++) {
        const yBase = r * GRID_STEP;
        let d = "";
        for (let x = 0; x <= GRID_W; x += GRID_SEG) {
          const w1 = Math.sin(x * 0.006 + t * 1.1 + r * 0.35) * 14;
          const w2 = Math.sin(x * 0.013 - t * 0.7 + r * 0.18) * 6;
          const y = yBase + w1 + w2;
          d += (x === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(2) + " ";
        }
        const el = linesRef.current[r];
        if (el) el.setAttribute("d", d);
      }
      for (let c = 0; c < cols; c++) {
        const xBase = c * GRID_STEP;
        let d = "";
        for (let y = 0; y <= GRID_H; y += GRID_SEG) {
          const w1 = Math.sin(y * 0.006 + t * 0.9 + c * 0.28) * 12;
          const w2 = Math.sin(y * 0.014 - t * 0.6 + c * 0.15) * 5;
          const x = xBase + w1 + w2;
          d += (y === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(1) + " ";
        }
        const el = linesRef.current[rows + c];
        if (el) el.setAttribute("d", d);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rows, cols]);

  return (
    <svg
      className="grid-svg"
      viewBox={`0 0 ${GRID_W} ${GRID_H}`}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {Array.from({ length: rows }).map((_, r) => (
        <path
          key={`r${r}`}
          ref={(el) => {
            linesRef.current[r] = el;
          }}
          stroke="rgba(137,170,204,0.22)"
          strokeWidth="1"
          fill="none"
        />
      ))}
      {Array.from({ length: cols }).map((_, c) => (
        <path
          key={`c${c}`}
          ref={(el) => {
            linesRef.current[rows + c] = el;
          }}
          stroke="rgba(137,170,204,0.22)"
          strokeWidth="1"
          fill="none"
        />
      ))}
    </svg>
  );
};

export const Hero = () => {
  const mode = useSectionMode("hero");
  const [roleIndex, setRoleIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    const id = setInterval(() => {
      setRoleIndex((i) => (i + 1) % ROLES.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat("de-CH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Europe/Zurich",
      }).format(new Date());
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      className={`cosmic ${modeToClass(mode)} relative min-h-screen w-full overflow-hidden c-bg`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 -z-0">
        <div
          className="absolute -top-[20vh] left-1/2 -translate-x-1/2 w-[120vw] h-[80vh] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(78, 133, 191, 0.28) 0%, rgba(78, 133, 191, 0.08) 35%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
        <div className="grid-floor">
          <WavyGrid />
        </div>
        <div className="grid-nodes">
          <div className="grid-nodes-inner">
            {[
              { left: "12%", top: "30%", delay: "0s" },
              { left: "78%", top: "25%", delay: "1.4s" },
              { left: "42%", top: "55%", delay: "2.6s" },
              { left: "88%", top: "60%", delay: "0.7s" },
              { left: "22%", top: "70%", delay: "3.1s" },
              { left: "62%", top: "82%", delay: "1.9s" },
              { left: "8%", top: "50%", delay: "2.2s" },
              { left: "55%", top: "18%", delay: "3.6s" },
            ].map((n, i) => (
              <span
                key={i}
                className="grid-node"
                style={{ left: n.left, top: n.top, animationDelay: n.delay }}
              />
            ))}
          </div>
        </div>
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.8'/></svg>\")",
          }}
        />
        <div className="vignette" />
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{
            background:
              "linear-gradient(to top, hsl(var(--c-bg)) 0%, transparent 100%)",
          }}
        />
      </div>

      {/* Floating pill navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4">
        <div
          className={`inline-flex items-center rounded-full border c-border-soft backdrop-blur-xl px-2 py-2 transition-shadow ${
            scrolled ? "shadow-lg shadow-black/40" : ""
          }`}
          style={{
            backgroundColor: "hsl(var(--c-surface) / 0.85)",
          }}
        >
          <a
            href="#"
            className="group relative flex items-center justify-center"
            aria-label="Trending Media"
          >
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full">
              <span className="absolute inset-0 rounded-full accent-gradient-anim" />
              <span
                className="relative inline-flex h-[calc(100%-3px)] w-[calc(100%-3px)] items-center justify-center rounded-full"
                style={{ backgroundColor: "hsl(var(--c-bg))" }}
              >
                <span className="font-mono text-[11px] font-medium tracking-tight c-text">
                  TM
                </span>
              </span>
            </span>
          </a>

          <span className="hidden sm:block w-px h-5 c-line-soft mx-1" />

          <ul className="hidden sm:flex items-center">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 c-text-55 hover:c-text hover:c-fill-6 transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <span className="hidden sm:block w-px h-5 c-line-soft mx-1" />

          <a
            href={CAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group/cta relative inline-flex items-center rounded-full text-xs sm:text-sm c-text"
          >
            <span className="absolute inset-[-2px] rounded-full opacity-0 group-hover/cta:opacity-100 transition-opacity accent-gradient-anim" />
            <span
              className="relative inline-flex items-center gap-1.5 rounded-full px-3 sm:px-4 py-1.5 sm:py-2"
              style={{ backgroundColor: "hsl(var(--c-surface))" }}
            >
              Erstgespräch
              <span className="inline-block translate-y-[-1px]">↗</span>
            </span>
          </a>
        </div>
      </nav>

      {/* Corner readouts */}
      <div className="hidden md:flex absolute top-6 left-6 z-10 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] c-text-45">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#60c882] pulse-dot" />
        <span>Live · CH-ZH · {time}</span>
      </div>
      <div className="hidden md:block absolute top-6 right-6 z-10 font-mono text-[10px] uppercase tracking-[0.18em] c-text-45">
        v.26 / Digitalisierung
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="blur-in flex items-center gap-3 mb-8">
          <span className="block h-px w-6 c-line" />
          <span className="font-mono text-[10px] md:text-[11px] c-text-55 uppercase tracking-[0.32em]">
            Digitalisierungspartner &middot; Schweizer KMU
          </span>
          <span className="block h-px w-6 c-line" />
        </div>

        <h1 className="name-reveal text-5xl sm:text-6xl md:text-8xl lg:text-[9rem] font-light leading-[0.92] tracking-[-0.04em] c-text mb-2">
          Trending
          <span className="font-display italic font-normal c-text-95">
            {" "}Media
          </span>
        </h1>

        <p
          className="blur-in text-lg md:text-2xl c-text-70 max-w-2xl mt-8 mb-4 font-light"
          style={{ animationDelay: "0.4s" }}
        >
          Wir bauen{" "}
          <span
            className="relative inline-grid align-baseline text-center"
            style={{ minWidth: "12ch" }}
          >
            <span
              key={roleIndex}
              className="font-mono font-medium c-text animate-role-fade col-start-1 row-start-1"
            >
              {ROLES[roleIndex]}
            </span>
            <span
              aria-hidden
              className="font-mono font-medium invisible col-start-1 row-start-1"
            >
              Landingpages
            </span>
          </span>
          {" "}für Schweizer KMU.
        </p>

        <p
          className="blur-in text-sm md:text-base c-text-45 max-w-lg leading-relaxed mb-12 font-light"
          style={{ animationDelay: "0.55s" }}
        >
          Wir analysieren Ihren Betrieb dort, wo im Alltag Reibung entsteht, und
          bauen daraus Lösungen, die im Tagesgeschäft tatsächlich wirken.
        </p>

        <div
          className="blur-in inline-flex flex-col sm:flex-row gap-3 sm:gap-4"
          style={{ animationDelay: "0.7s" }}
        >
          <a
            href={CAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group/p relative rounded-full text-sm px-7 py-3.5 inline-flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
            style={{
              backgroundColor: "rgb(var(--c-fg))",
              color: "hsl(var(--c-bg))",
            }}
          >
            <span className="absolute inset-[-2px] rounded-full opacity-0 group-hover/p:opacity-100 transition-opacity accent-gradient-anim -z-10" />
            Erstgespräch buchen
            <span className="inline-block">→</span>
          </a>
          <a
            href="/selbstcheck"
            className="group/s relative rounded-full text-sm px-7 py-3.5 border c-border-strong c-text inline-flex items-center justify-center gap-2 transition-all duration-300 hover:c-border-stronger"
            style={{
              backgroundColor: "rgb(var(--c-fg) / 0.02)",
            }}
          >
            Selbstcheck starten
            <span className="inline-block opacity-60">↗</span>
          </a>
        </div>

        <p
          className="blur-in mt-7 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.22em] c-text-35"
          style={{ animationDelay: "0.85s" }}
        >
          30 min &middot; unverbindlich &middot; ehrliche einschätzung
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
        <span className="font-mono text-[10px] c-text-35 uppercase tracking-[0.3em]">
          Scroll
        </span>
        <div className="relative w-px h-12 overflow-hidden c-line-soft">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-down accent-gradient" />
        </div>
      </div>
    </section>
  );
};
