import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  ExcelChaosIllo,
  DoubleEntryIllo,
  KnowledgeSiloIllo,
  AIFizzleIllo,
} from "./illustrations";
import { useSectionMode, modeToClass } from "@/lib/theme";
import { SectionBackdrop } from "@/components/SectionBackdrop";

type Pain = {
  Illo: ComponentType;
  tag: string;
  title: string;
  description: string;
  metric: { value: string; label: string };
};

const PainCard = ({ pain, index }: { pain: Pain; index: number }) => {
  const illoRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const svg = illoRef.current?.querySelector("svg") as
      | (SVGSVGElement & {
          pauseAnimations?: () => void;
          unpauseAnimations?: () => void;
        })
      | null;
    svg?.pauseAnimations?.();
  }, []);

  useEffect(() => {
    const svg = illoRef.current?.querySelector("svg") as
      | (SVGSVGElement & {
          pauseAnimations?: () => void;
          unpauseAnimations?: () => void;
        })
      | null;
    if (!svg) return;
    if (hovered) svg.unpauseAnimations?.();
    else svg.pauseAnimations?.();
  }, [hovered]);

  return (
    <div
      className="group c-card-ring relative h-full rounded-3xl c-surface overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative h-full">
        {/* Illustration panel — always dark for visual contrast */}
        <div
          className="relative h-32 md:h-36 overflow-hidden"
          style={{ backgroundColor: "hsl(218 15% 7%)" }}
        >
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
          <div
            ref={illoRef}
            className="absolute inset-0 flex items-center justify-center px-8 py-4 text-white"
          >
            <pain.Illo />
          </div>
          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm px-2.5 py-1">
            <span className="block h-1 w-1 rounded-full bg-[#ff5a5a]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/65">
              {pain.tag}
            </span>
          </div>
          <span className="absolute top-3 right-4 font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
            {String(index + 1).padStart(2, "0")} / 04
          </span>
        </div>

        {/* Text content — themed */}
        <div className="p-7 md:p-8">
          <h3 className="text-lg md:text-xl font-medium tracking-tight c-text leading-snug">
            {pain.title}
          </h3>
          <p className="mt-3 text-sm md:text-[15px] c-text-55 leading-relaxed">
            {pain.description}
          </p>
          <div className="mt-5 flex items-baseline gap-3 pt-4 border-t c-border-faint">
            <span className="font-display italic text-2xl md:text-3xl c-text leading-none">
              {pain.metric.value}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] c-text-45">
              {pain.metric.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const pains: Pain[] = [
  {
    Illo: ExcelChaosIllo,
    tag: "Daten-Chaos",
    title: "Excel-Listen, die niemand mehr durchblickt",
    description:
      "Daten leben in fünf Tabellen, drei Mailboxen und einem Ordner-Chaos. Jede Auswertung ist Handarbeit.",
    metric: { value: "~14h", label: "pro Woche verloren" },
  },
  {
    Illo: DoubleEntryIllo,
    tag: "Medienbruch",
    title: "Doppelte Erfassung in jedem System",
    description:
      "Die gleichen Informationen werden täglich mehrfach getippt: im CRM, in der Buchhaltung, im Projekt-Tool.",
    metric: { value: "3-5×", label: "gleiche Eingabe" },
  },
  {
    Illo: KnowledgeSiloIllo,
    tag: "Wissens-Silo",
    title: "Wissen, das nur in einem Kopf existiert",
    description:
      "Wenn diese eine Person Ferien hat, steht der halbe Betrieb. Prozesse sind nirgendwo dokumentiert.",
    metric: { value: "1 Person", label: "Single Point of Failure" },
  },
  {
    Illo: AIFizzleIllo,
    tag: "Tool-Friedhof",
    title: "KI-Versprechen, die im Alltag nichts bringen",
    description:
      "Tools wurden eingeführt, aber niemand nutzt sie. Der Aufwand ist gleich geblieben, die Lizenzkosten nicht.",
    metric: { value: "0 ROI", label: "trotz Lizenzkosten" },
  },
];

export const ProblemMirror = () => {
  const mode = useSectionMode("problem");
  return (
    <section
      className={`cosmic ${modeToClass(mode)} relative isolate py-20 md:py-32 c-bg`}
    >
      <SectionBackdrop seed={1} />
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="block w-8 h-px c-line" />
            <span className="font-mono text-[10px] md:text-[11px] c-text-55 uppercase tracking-[0.3em]">
              Diagnose &middot; Kommt Ihnen bekannt vor?
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] tracking-[-0.02em] c-text">
            Die typischen{" "}
            <span className="font-display italic font-normal c-text-95">
              Reibungs&shy;verluste
            </span>
            <br />
            in Schweizer KMU.
          </h2>
          <p className="mt-6 text-base md:text-lg c-text-55 leading-relaxed max-w-xl mx-auto font-light">
            Wir hören diese Punkte in fast jedem Erstgespräch. Sie sind kein
            Zeichen schlechter Organisation, sondern dafür, dass Ihr Betrieb
            schneller gewachsen ist als seine Werkzeuge.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:gap-6 md:grid-cols-2">
          {pains.map((p, i) => (
            <PainCard key={p.title} pain={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};
