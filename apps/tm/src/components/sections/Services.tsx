import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  WorkflowIllo,
  AIBrainIllo,
  CustomSoftwareIllo,
  WebIllo,
} from "./illustrations";
import { useSectionMode, modeToClass } from "@/lib/theme";
import { SectionBackdrop } from "@/components/SectionBackdrop";

type Accent = {
  from: string;
  to: string;
  glow: string;
  soft: string;
  text: string;
};

type Service = {
  Illo: ComponentType;
  tag: string;
  title: string;
  description: string;
  bullets: string[];
  span: string;
  accent: Accent;
};

const ServiceCard = ({
  service,
  index,
}: {
  service: Service;
  index: number;
}) => {
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

  const a = service.accent;
  return (
    <div
      className={`${service.span}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="group c-card-ring relative h-full rounded-3xl c-surface overflow-hidden flex flex-col"
        style={{
          ["--card-accent-from" as string]: a.from,
          ["--card-accent-to" as string]: a.to,
          ["--card-accent-glow" as string]: a.glow,
        }}
      >
        <span
          className="absolute inset-x-0 top-0 h-[2px] z-10"
          style={{ background: `linear-gradient(90deg, ${a.from} 0%, ${a.to} 100%)` }}
        />
        {/* Illustration panel — always dark */}
        <div
          className="relative h-40 md:h-44 overflow-hidden"
          style={{ backgroundColor: "hsl(218 15% 7%)" }}
        >
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "linear-gradient(rgba(137,170,204,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(137,170,204,0.04) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
          <div
            className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-30 transition-opacity duration-700"
            style={{
              background: `radial-gradient(circle, ${a.glow} 0%, transparent 70%)`,
            }}
          />
          <div
            ref={illoRef}
            className="absolute inset-0 flex items-center justify-center px-10 py-6"
            style={{ color: a.text }}
          >
            <service.Illo />
          </div>
          <div
            className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border backdrop-blur-sm px-2.5 py-1"
            style={{
              borderColor: a.soft,
              backgroundColor: "rgba(255,255,255,0.04)",
            }}
          >
            <span
              className="block h-1 w-1 rounded-full"
              style={{ backgroundColor: a.from, boxShadow: `0 0 6px ${a.glow}` }}
            />
            <span
              className="font-mono text-[9px] uppercase tracking-[0.18em]"
              style={{ color: a.text }}
            >
              {service.tag}
            </span>
          </div>
          <span
            className="absolute top-3 right-4 font-mono text-[10px] uppercase tracking-[0.22em]"
            style={{ color: a.text, opacity: 0.65 }}
          >
            {String(index + 1).padStart(2, "0")} / 04
          </span>
        </div>

        {/* Text content — themed */}
        <div className="flex flex-col p-7 md:p-8 flex-1">
          <h3 className="text-xl md:text-2xl font-light tracking-[-0.01em] c-text leading-tight">
            {service.title}
          </h3>
          <p className="mt-3 text-sm md:text-[15px] c-text-55 leading-relaxed font-light">
            {service.description}
          </p>
          <ul className="mt-5 pt-5 border-t c-border-faint flex flex-wrap gap-1.5">
            {service.bullets.map((b) => (
              <li
                key={b}
                className="font-mono text-[10px] uppercase tracking-[0.16em] rounded-full border px-2.5 py-1"
                style={{
                  borderColor: a.soft,
                  backgroundColor: a.soft,
                  color: a.text,
                }}
              >
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const services: Service[] = [
  {
    Illo: WorkflowIllo,
    tag: "Operations",
    title: "Prozesse digitalisieren",
    description:
      "Wir machen sichtbar, wo in Ihrem Alltag Aufwand entsteht. Zettel, Excel-Listen und Medienbrüche ersetzen wir durch saubere digitale Abläufe.",
    bullets: ["Prozess-Audit", "System-Integration", "Change-Management"],
    span: "md:col-span-7",
    accent: {
      from: "#5aa8ff",
      to: "#4e85bf",
      glow: "rgba(90,168,255,0.4)",
      soft: "rgba(90,168,255,0.14)",
      text: "#8cc3ff",
    },
  },
  {
    Illo: AIBrainIllo,
    tag: "Intelligence",
    title: "KI & Automatisierung mit Substanz",
    description:
      "Wir integrieren KI dort, wo sie konkret Mehrwert schafft: vom internen Assistenten bis zur automatisierten Verarbeitung wiederkehrender Aufgaben.",
    bullets: ["KI-Assistent", "RAG-Systeme", "Personalisierte Agents"],
    span: "md:col-span-5",
    accent: {
      from: "#b18cff",
      to: "#e260d8",
      glow: "rgba(177,140,255,0.4)",
      soft: "rgba(177,140,255,0.14)",
      text: "#c9a8ff",
    },
  },
  {
    Illo: CustomSoftwareIllo,
    tag: "Engineering",
    title: "Massgeschneiderte Software",
    description:
      "Wenn Standard-Software nicht passt, bauen wir genau das Werkzeug, das in Ihrem Betrieb fehlt — stabil, wartbar und zum Mitwachsen gemacht.",
    bullets: ["Web-Apps", "Datenbanken", "APIs & Schnittstellen"],
    span: "md:col-span-5",
    accent: {
      from: "#ffb454",
      to: "#ff7a3c",
      glow: "rgba(255,160,80,0.4)",
      soft: "rgba(255,160,80,0.14)",
      text: "#ffb86b",
    },
  },
  {
    Illo: WebIllo,
    tag: "Reach",
    title: "Web & Landingpages",
    description:
      "Performante Webauftritte, die Sichtbarkeit in Anfragen verwandeln — mit klarer Conversion-Logik statt Pixel-Spielerei.",
    bullets: ["Landingpages", "SEO-Foundation", "Conversion-Tracking", "Direkte Terminbuchung"],
    span: "md:col-span-7",
    accent: {
      from: "#b18cff",
      to: "#e260d8",
      glow: "rgba(177,140,255,0.4)",
      soft: "rgba(177,140,255,0.14)",
      text: "#c9a8ff",
    },
  },
];

export const Services = () => {
  const mode = useSectionMode("services");
  return (
    <section
      id="leistungen"
      className={`cosmic ${modeToClass(mode)} relative isolate py-20 md:py-32 c-bg`}
    >
      <SectionBackdrop seed={2} />
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <div className="flex flex-col items-center text-center gap-6 mb-16">
          <div className="max-w-xl">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="hidden sm:block w-8 h-px c-line" />
              <span className="font-mono text-[10px] md:text-[11px] c-text-55 uppercase tracking-[0.3em]">
                Leistungen &middot; 04
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] tracking-[-0.02em] c-text">
              Strategie, Software,{" "}
              <span className="font-display italic font-normal c-text-95">
                Umsetzung.
              </span>
              <br />
              Ein Team.
            </h2>
          </div>
          <p className="max-w-md mx-auto text-base md:text-lg c-text-55 leading-relaxed font-light">
            Vier Bereiche, in denen wir Unternehmen begleiten. Immer mit dem
            gleichen Anspruch: spürbar weniger Aufwand, mehr Qualität, mehr Zeit
            für das Eigentliche.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {services.map((s, i) => (
            <ServiceCard key={s.title} service={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};
