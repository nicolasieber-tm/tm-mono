import { Check, Compass, Handshake, Hammer } from "lucide-react";
import type { ComponentType } from "react";
import { useSectionMode, modeToClass } from "@/lib/theme";
import { SectionBackdrop } from "@/components/SectionBackdrop";

type Pillar = {
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  roman: string;
  title: string;
  description: string;
  color: { from: string; glow: string; text: string };
};

const pillars: Pillar[] = [
  {
    Icon: Compass,
    roman: "I",
    title: "Wir starten beim Alltag, nicht bei der Technologie.",
    description:
      "Bevor wir über Software sprechen, verstehen wir, wo im Tagesgeschäft Zeit verloren geht — im Büro, vor Ort, im Kundenkontakt.",
    color: { from: "#5aa8ff", glow: "rgba(90,168,255,0.5)", text: "#5aa8ff" },
  },
  {
    Icon: Handshake,
    roman: "II",
    title: "Wir denken wie Unternehmer.",
    description:
      "Wir betreiben selbst Produkte am Markt. Deshalb wissen wir, was operativ funktioniert und was nur in Slides gut aussieht.",
    color: { from: "#ff8a4e", glow: "rgba(255,138,78,0.5)", text: "#ff8a4e" },
  },
  {
    Icon: Hammer,
    roman: "III",
    title: "Wir setzen auch um.",
    description:
      "Konzepte ohne Umsetzung helfen niemandem. Wir liefern Strategie, Software und Rollout aus einer Hand — nicht über drei Dienstleister verteilt.",
    color: { from: "#34d4a4", glow: "rgba(52,212,164,0.5)", text: "#1e9d7c" },
  },
];

const reasonColors = ["#5aa8ff", "#b18cff", "#ff8a4e", "#34d4a4"];

const reasons = [
  {
    title: "KI dort, wo sie wirklich wirkt",
    description:
      "Wir setzen KI nicht als Buzzword ein, sondern dort, wo sie messbar Zeit spart oder bessere Entscheidungen ermöglicht.",
  },
  {
    title: "Strategie + Umsetzung in einer Hand",
    description:
      "Kein Ping-Pong zwischen Beratung, Agentur und IT. Wir analysieren, entwickeln und rollen aus — als ein Team.",
  },
  {
    title: "Eigene Produkte im täglichen Einsatz",
    description:
      "Wir kennen die Realität von SaaS, Support und Skalierung, weil wir selbst Produkte am Markt betreiben.",
  },
  {
    title: "Praxis vor Theorie",
    description:
      "Jede Lösung wird daran gemessen, was sie im Alltag bewirkt: weniger Aufwand, weniger Fehler, mehr Umsatz — nicht hübschere Slides.",
  },
];

export const WhyUs = () => {
  const mode = useSectionMode("whyus");

  return (
    <section
      id="warum"
      className={`cosmic ${modeToClass(mode)} relative isolate py-20 md:py-32 c-bg`}
    >
      <SectionBackdrop seed={4} />
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="hidden sm:block w-8 h-px c-line" />
            <span className="font-mono text-[10px] md:text-[11px] c-text-55 uppercase tracking-[0.3em]">
              Manifest &middot; Partner statt Anbieter
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] tracking-[-0.02em] c-text">
            Kein Beratungshaus.{" "}
            <span className="font-display italic font-normal c-text-95">
              Keine
            </span>
            <br />
            klassische Agentur.
          </h2>
          <p className="mt-6 text-base md:text-lg c-text-55 leading-relaxed max-w-xl mx-auto font-light">
            Trending Media begleitet Unternehmen langfristig durch ihre
            Digitalisierung — mit echtem Verständnis für operative Abläufe und
            Lösungen, die im Tagesgeschäft tatsächlich Wirkung zeigen.
          </p>
        </div>

        {/* Pillars (manifesto style) */}
        <div className="grid gap-10 md:gap-12 md:grid-cols-3 mb-24 md:mb-32">
          {pillars.map((p) => {
            const Icon = p.Icon;
            const c = p.color;
            return (
              <article key={p.roman} className="group relative pl-6 md:pl-7">
                {/* Vertical accent rail */}
                <span
                  className="absolute left-0 top-0 bottom-0 w-px"
                  style={{
                    background: `linear-gradient(180deg, ${c.from} 0%, transparent 100%)`,
                  }}
                />
                <span
                  className="absolute left-[-2.5px] top-0 inline-block h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: c.from,
                    boxShadow: `0 0 10px 2px ${c.glow}`,
                  }}
                />

                {/* Roman numeral + icon */}
                <div className="flex items-center gap-4 mb-6">
                  <span
                    className="font-display italic text-5xl md:text-6xl leading-none"
                    style={{ color: c.text }}
                  >
                    {p.roman}.
                  </span>
                  <span
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border"
                    style={{
                      backgroundColor: `${c.from}1f`,
                      borderColor: `${c.from}55`,
                      color: c.text,
                    }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.6} />
                  </span>
                </div>

                <h3 className="text-xl md:text-2xl font-light tracking-[-0.01em] c-text leading-snug">
                  {p.title}
                </h3>
                <p className="mt-4 text-sm md:text-[15px] c-text-55 leading-relaxed font-light">
                  {p.description}
                </p>
              </article>
            );
          })}
        </div>

        {/* Reasons divider */}
        <div className="flex items-center gap-3 mb-10">
          <span className="font-mono text-[10px] md:text-[11px] c-text-55 uppercase tracking-[0.3em]">
            Weitere Gründe
          </span>
          <span className="block flex-1 h-px c-line-soft" />
          <span className="font-mono text-[10px] c-text-45 tabular-nums">
            04
          </span>
        </div>

        {/* Reasons grid — gap-px so the separators always blend with the section background */}
        <div className="c-bg rounded-2xl overflow-hidden border c-border-faint">
          <ul className="grid md:grid-cols-2 gap-px c-bg">
            {reasons.map((r, i) => {
              const col = reasonColors[i % reasonColors.length];
              return (
                <li
                  key={r.title}
                  className="group relative c-surface p-6 md:p-8 transition-colors hover:c-surface-2"
                >
                  <div className="flex items-start gap-4">
                    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                      <span
                        className="absolute inset-0 rounded-full opacity-90"
                        style={{
                          background: `linear-gradient(135deg, ${col} 0%, ${col}aa 100%)`,
                          boxShadow: `0 0 12px ${col}66`,
                        }}
                      />
                      <span className="relative inline-flex h-[calc(100%-3px)] w-[calc(100%-3px)] items-center justify-center rounded-full c-surface">
                        <Check
                          className="h-3.5 w-3.5"
                          strokeWidth={2.25}
                          style={{ color: col }}
                        />
                      </span>
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3">
                        <h3 className="text-base md:text-lg font-medium tracking-tight c-text">
                          {r.title}
                        </h3>
                        <span
                          className="font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums shrink-0"
                          style={{ color: col }}
                        >
                          0{i + 1}
                        </span>
                      </div>
                      <p className="mt-2 text-sm c-text-55 leading-relaxed">
                        {r.description}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};
