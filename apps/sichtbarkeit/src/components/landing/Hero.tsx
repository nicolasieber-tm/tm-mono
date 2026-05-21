import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSectionMode, modeToClass } from "@/lib/theme";

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
          ref={(el) => { linesRef.current[r] = el; }}
          stroke="rgba(167,139,250,0.22)"
          strokeWidth="1"
          fill="none"
        />
      ))}
      {Array.from({ length: cols }).map((_, c) => (
        <path
          key={`c${c}`}
          ref={(el) => { linesRef.current[rows + c] = el; }}
          stroke="rgba(167,139,250,0.22)"
          strokeWidth="1"
          fill="none"
        />
      ))}
    </svg>
  );
};

export const Hero = () => {
  const mode = useSectionMode("hero");
  const [time, setTime] = useState("");

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
      id="top"
      className={`cosmic ${modeToClass(mode)} relative min-h-screen w-full overflow-hidden c-bg`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 -z-0">
        <div
          className="absolute -top-[20vh] left-1/2 -translate-x-1/2 w-[120vw] h-[80vh] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(167, 139, 250, 0.30) 0%, rgba(124, 58, 237, 0.10) 35%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
        <div className="grid-floor">
          <WavyGrid />
        </div>
        <div className="vignette" />
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: "linear-gradient(to top, hsl(var(--c-bg)) 0%, transparent 100%)" }}
        />
      </div>

      {/* Corner readouts */}
      <div className="hidden md:flex absolute top-6 left-6 z-10 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] c-text-45">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#60c882] pulse-dot" />
        <span>Live · CH · {time}</span>
      </div>
      <div className="hidden md:block absolute top-6 right-6 z-10 font-mono text-[10px] uppercase tracking-[0.18em] c-text-45">
        sichtbarkeit.trendingmedia.ch
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-32 sm:pt-28 sm:pb-24 text-center">
        <div className="blur-in flex items-center gap-3 mb-8">
          <span className="block h-px w-6 c-line" />
          <span className="font-mono text-[10px] md:text-[11px] c-text-55 uppercase tracking-[0.32em]">
            Websites für KMU · Schweiz
          </span>
          <span className="block h-px w-6 c-line" />
        </div>

        <h1 className="name-reveal text-[2.5rem] xs:text-4xl sm:text-5xl md:text-7xl lg:text-[7.5rem] font-light leading-[1.08] sm:leading-[0.95] tracking-[-0.02em] sm:tracking-[-0.04em] c-text mb-2 max-w-5xl">
          Eine Website, die
          <span className="font-display italic font-normal c-text-95"> Vertrauen </span>
          schafft
          <span className="block">
            und{" "}
            <span className="font-display italic font-normal c-text-95">Anfragen</span>{" "}
            bringt.
          </span>
        </h1>

        <p
          className="blur-in text-base sm:text-lg md:text-xl c-text-70 max-w-2xl mt-8 sm:mt-10 mb-4 font-normal sm:font-light leading-relaxed"
          style={{ animationDelay: "0.4s" }}
        >
          Viele KMU verlieren täglich Anfragen, weil ihre Website veraltet wirkt, auf dem
          Handy schwer nutzbar ist oder online kaum gefunden wird.
        </p>

        <p
          className="blur-in text-sm md:text-base c-text-45 max-w-xl leading-relaxed mb-10 sm:mb-12 font-normal sm:font-light"
          style={{ animationDelay: "0.55s" }}
        >
          Wir sorgen dafür, dass Ihr Unternehmen online so professionell auftritt, wie Sie
          tatsächlich arbeiten.
        </p>

        <div
          className="blur-in inline-flex flex-col sm:flex-row gap-3 sm:gap-4"
          style={{ animationDelay: "0.7s" }}
        >
          <Link
            to="/beratung"
            className="group/p relative rounded-full text-sm px-7 py-3.5 inline-flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
            style={{ backgroundColor: "rgb(var(--c-fg))", color: "hsl(var(--c-bg))" }}
          >
            <span className="absolute inset-[-2px] rounded-full opacity-0 group-hover/p:opacity-100 transition-opacity accent-gradient-anim -z-10" />
            Kostenlose Beratung buchen
            <span className="inline-block">→</span>
          </Link>
          <a
            href="#ablauf"
            className="group/s relative rounded-full text-sm px-7 py-3.5 border c-border-strong c-text inline-flex items-center justify-center gap-2 transition-all duration-300 hover:c-border-stronger"
            style={{ backgroundColor: "rgb(var(--c-fg) / 0.02)" }}
          >
            So läuft es ab
            <span className="inline-block opacity-60">↓</span>
          </a>
        </div>

        <p
          className="blur-in mt-7 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.22em] c-text-35"
          style={{ animationDelay: "0.85s" }}
        >
          unverbindlich &middot; antwort innerhalb 48 stunden
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-3">
        <span className="font-mono text-[10px] c-text-35 uppercase tracking-[0.3em]">Scroll</span>
        <div className="relative w-px h-12 overflow-hidden c-line-soft">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-down accent-gradient" />
        </div>
      </div>
    </section>
  );
};
