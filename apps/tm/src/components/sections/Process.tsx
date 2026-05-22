import { Ear, ScanSearch, PenTool, Rocket } from "lucide-react";
import type { ComponentType } from "react";
import { useSectionMode, modeToClass, type Mode } from "@/lib/theme";
import { SectionBackdrop } from "@/components/SectionBackdrop";

type Step = {
  number: string;
  title: string;
  description: string;
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  color: { from: string; to: string; glow: string; text: string };
};

const steps: Step[] = [
  {
    number: "01",
    title: "Zuhören",
    description:
      "Wir sprechen mit Geschäftsführung, Mitarbeitenden und wo es Sinn macht auch mit Ihren Kunden. Ziel: ein ehrliches Bild davon, wo im Alltag wirklich Aufwand entsteht.",
    Icon: Ear,
    color: { from: "#5aa8ff", to: "#4e85bf", glow: "rgba(90,168,255,0.5)", text: "#8cc3ff" },
  },
  {
    number: "02",
    title: "Analysieren",
    description:
      "Wir identifizieren Medienbrüche, manuelle Doppelarbeit und Reibungsverluste. Statt Buzzwords liefern wir eine konkrete Liste der grössten Hebel.",
    Icon: ScanSearch,
    color: { from: "#b18cff", to: "#e260d8", glow: "rgba(177,140,255,0.5)", text: "#c9a8ff" },
  },
  {
    number: "03",
    title: "Lösung entwickeln",
    description:
      "Wir entscheiden gemeinsam, was Standard-Software löst, was eigene Software braucht und wo KI tatsächlich Mehrwert schafft — nicht weil es im Trend liegt.",
    Icon: PenTool,
    color: { from: "#ffb454", to: "#ff7a3c", glow: "rgba(255,160,80,0.5)", text: "#ffb86b" },
  },
  {
    number: "04",
    title: "Umsetzen & begleiten",
    description:
      "Wir bauen, integrieren und rollen aus. Danach bleiben wir Ansprechpartner, damit aus dem Projekt ein dauerhaft funktionierender Prozess wird.",
    Icon: Rocket,
    color: { from: "#34d4a4", to: "#1f9d8f", glow: "rgba(52,212,164,0.5)", text: "#5ee0b8" },
  },
];

/* Theme-aware accent colors used for the connection line / nodes */
const accent = (mode: Mode) => {
  // Accent gradient endpoints stay the same; only the surrounding rail tint adjusts
  return {
    railFill:
      mode === "light"
        ? "rgba(20, 20, 20, 0.08)"
        : "rgba(255, 255, 255, 0.08)",
    nodeRing:
      mode === "light"
        ? "rgba(20, 20, 20, 0.15)"
        : "rgba(255, 255, 255, 0.15)",
  };
};

export const Process = () => {
  const mode = useSectionMode("process");
  const { railFill, nodeRing } = accent(mode);

  return (
    <section
      id="vorgehen"
      className={`cosmic ${modeToClass(mode)} relative isolate py-20 md:py-32 c-bg`}
    >
      <SectionBackdrop seed={3} />
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="hidden sm:block w-8 h-px c-line" />
            <span className="font-mono text-[10px] md:text-[11px] c-text-55 uppercase tracking-[0.3em]">
              Vorgehen &middot; 04 Phasen
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] tracking-[-0.02em] c-text">
            Vom echten{" "}
            <span className="font-display italic font-normal c-text-95">
              Problem
            </span>
            <br />
            zur funktionierenden Lösung.
          </h2>
          <p className="mt-6 text-base md:text-lg c-text-55 leading-relaxed max-w-xl mx-auto font-light">
            Unsere Produkte und Projekte entstehen nicht am Whiteboard, sondern
            aus Gesprächen mit Unternehmen, die mit ineffizienten Abläufen
            kämpfen. Genau diesen Weg gehen wir auch mit Ihnen.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Horizontal rail (desktop) — the traveling drop is in sync
              with the icon pulses (10s, linear) and crosses each icon
              at the exact moment that icon peaks. */}
          <div
            className="hidden md:block absolute top-[28px] left-0 right-0 h-px overflow-visible pointer-events-none"
            aria-hidden
          >
            <div
              className="absolute inset-0"
              style={{ backgroundColor: railFill }}
            />
            <span
              className="process-dot absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full"
              style={{
                backgroundColor: "rgba(255,255,255,0.95)",
                boxShadow:
                  "0 0 10px 2px rgba(255,255,255,0.55), 0 0 22px 6px rgba(255,255,255,0.25)",
              }}
            />
          </div>

          {/* Vertical rail (mobile) */}
          <div
            className="md:hidden absolute left-[27px] top-0 bottom-0 w-px"
            style={{ backgroundColor: railFill }}
            aria-hidden
          />

          <ol className="grid gap-12 md:gap-6 md:grid-cols-4">
            {/* Staggered water-drop pulse over a 10s cycle (1 → 2 → 3 → 4).
                Keyframe peaks at 6% (= 0.6s). Positive delay shifts each
                icon's first peak to the desired clock time. */}
            {steps.map((step, i) => {
              const Icon = step.Icon;
              const c = step.color;
              const peakTimes = [1.25, 3.75, 6.25, 8.75];
              const delay = peakTimes[i] - 0.6;
              return (
                <li key={step.number} className="relative">
                  {/* Node (top dot) */}
                  <div className="relative md:flex md:items-center md:justify-center">
                    <span
                      className="relative z-10 inline-flex h-14 w-14 items-center justify-center rounded-full c-surface border"
                      style={{ borderColor: nodeRing }}
                    >
                      <span
                        className="process-icon-glow absolute inset-0 rounded-full"
                        style={{
                          background: `linear-gradient(135deg, ${c.from} 0%, ${c.to} 100%)`,
                          boxShadow: `0 0 22px ${c.glow}`,
                          animationDelay: `${delay}s`,
                        }}
                      />
                      <span
                        className="relative inline-flex h-[calc(100%-4px)] w-[calc(100%-4px)] items-center justify-center rounded-full c-surface"
                      >
                        <Icon
                          className="h-5 w-5"
                          strokeWidth={1.5}
                          style={{ color: c.text }}
                        />
                      </span>
                    </span>
                  </div>

                  <div className="mt-6 md:mt-8 md:text-center pl-16 md:pl-0">
                    <div className="flex items-baseline gap-2 md:justify-center mb-3">
                      <span className="font-mono text-[11px] uppercase tracking-[0.22em] c-text-55">
                        Phase
                      </span>
                      <span
                        className="font-display italic text-3xl md:text-4xl leading-none"
                        style={{ color: c.text }}
                      >
                        {step.number}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-light tracking-[-0.01em] c-text leading-tight">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm md:text-[15px] c-text-55 leading-relaxed font-light md:px-2">
                      {step.description}
                    </p>
                  </div>

                  {/* Mobile node (overrides desktop centering) */}
                  <span
                    className="md:hidden absolute left-0 top-0 inline-flex h-14 w-14 items-center justify-center rounded-full c-surface border"
                    style={{ borderColor: nodeRing }}
                    aria-hidden
                  >
                    <Icon
                      className="h-5 w-5"
                      strokeWidth={1.5}
                      style={{ color: c.text }}
                    />
                  </span>

                  {/* Step index badge (top-right of icon, desktop) */}
                  <span
                    className="hidden md:block absolute top-0 left-1/2 translate-x-[24px] -translate-y-1 font-mono text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: c.text, opacity: 0.7 }}
                  >
                    {String(i + 1).padStart(2, "0")}/04
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};
