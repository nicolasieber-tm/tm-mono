import { Search, ClipboardList, Hammer } from "lucide-react";
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
    title: "Kostenlose Analyse",
    description:
      "Wir schauen uns Ihren aktuellen Auftritt an und sagen Ihnen ehrlich, was funktioniert und wo Anfragen verloren gehen.",
    Icon: Search,
    color: { from: "#a78bfa", to: "#7c3aed", glow: "rgba(167,139,250,0.5)", text: "#c4b5fd" },
  },
  {
    number: "02",
    title: "Klares Konzept",
    description:
      "Sie erhalten verständliche Empfehlungen und einen konkreten Vorschlag — abgestimmt auf Ihr Unternehmen und Ihr Budget.",
    Icon: ClipboardList,
    color: { from: "#c084fc", to: "#9333ea", glow: "rgba(192,132,252,0.5)", text: "#d8b4fe" },
  },
  {
    number: "03",
    title: "Saubere Umsetzung",
    description:
      "Wir setzen die Website um, mit klaren Abstimmungen, festen Terminen und ohne, dass Sie sich um Technik kümmern müssen.",
    Icon: Hammer,
    color: { from: "#8b5cf6", to: "#6d28d9", glow: "rgba(139,92,246,0.5)", text: "#a78bfa" },
  },
];

const accent = (_mode: Mode) => ({
  railFill: "rgba(255, 255, 255, 0.08)",
  nodeRing: "rgba(255, 255, 255, 0.15)",
});

export const Process = () => {
  const mode = useSectionMode("process");
  const { railFill, nodeRing } = accent(mode);

  return (
    <section
      id="ablauf"
      className={`cosmic ${modeToClass(mode)} relative isolate py-20 md:py-32 c-bg`}
    >
      <SectionBackdrop seed={6} />
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="block w-8 h-px c-line" />
            <span className="font-mono text-[10px] md:text-[11px] c-text-55 uppercase tracking-[0.3em]">
              Ablauf &middot; 03 Schritte
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] tracking-[-0.02em] c-text">
            In{" "}
            <span className="font-display italic font-normal c-text-95">drei</span>{" "}
            einfachen
            <br />
            Schritten.
          </h2>
          <p className="mt-6 text-base md:text-lg c-text-55 leading-relaxed max-w-xl mx-auto font-light">
            Unkompliziert, transparent und ohne Verpflichtung. Sie entscheiden nach
            jedem Schritt selbst.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Horizontal rail (desktop) — spans exactly between icon 1 and icon 3
              centers. With md:gap-6 (24px) and 3 cols, col1/col3 centers sit at
              calc((100% - 48px) / 6) from container left/right. The dot animates
              0% → 100% within this rail so its midpoint = icon 2. */}
          <div
            className="hidden md:block absolute top-[28px] h-px overflow-visible pointer-events-none"
            style={{
              left: "calc((100% - 48px) / 6)",
              right: "calc((100% - 48px) / 6)",
            }}
            aria-hidden
          >
            <div className="absolute inset-0" style={{ backgroundColor: railFill }} />
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
            className="md:hidden absolute left-7 top-0 bottom-0 w-px"
            style={{ backgroundColor: railFill }}
            aria-hidden
          />

          <ol className="grid gap-12 md:gap-6 md:grid-cols-3">
            {/* 3 evenly-spaced columns: icon centers at 16.67%, 50%, 83.33%.
                Dot travels 10s linear → reaches each at 1.67s, 5s, 8.33s.
                Pulse peaks at 6% (= 0.6s), so delay = peakTime - 0.6. */}
            {steps.map((step, i) => {
              const Icon = step.Icon;
              const c = step.color;
              // 16s cycle. Dot keyframe: left:0% at 10% (=1.6s),
              // left:50% at 50% (=8s), left:100% at 90% (=14.4s).
              // Pulse peak is at 6% of cycle (=0.96s into the pulse).
              const peakTimes = [1.6, 8.0, 14.4];
              const delay = peakTimes[i] - 0.96;
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
                      <span className="relative inline-flex h-[calc(100%-4px)] w-[calc(100%-4px)] items-center justify-center rounded-full c-surface">
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
                        Schritt
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

                  {/* Mobile node */}
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

                  {/* Step index badge */}
                  <span
                    className="hidden md:block absolute top-0 left-1/2 translate-x-[24px] -translate-y-1 font-mono text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: c.text, opacity: 0.7 }}
                  >
                    {String(i + 1).padStart(2, "0")}/03
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
