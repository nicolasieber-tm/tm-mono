import { ArrowUpRight, Clock, FileText, Globe } from "lucide-react";
import type { ComponentType } from "react";
import { useSectionMode, modeToClass } from "@/lib/theme";
import { SectionBackdrop } from "@/components/SectionBackdrop";

type Accent = {
  from: string;
  to: string;
  glow: string;
  soft: string;
  text: string;
};

type Product = {
  name: string;
  tag: string;
  description: string;
  href: string;
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  domain: string;
  status: string;
  accent: Accent;
};

const products: Product[] = [
  {
    name: "AURON",
    tag: "Hauptprodukt",
    description:
      "Intelligente Zeiterfassung für Handwerks- und Servicebetriebe. Entstanden aus dutzenden Gesprächen mit Betrieben, die ihre Stunden bisher auf Zetteln und in Excel verloren haben.",
    href: "https://auron.trendingmedia.ch",
    Icon: Clock,
    domain: "auron.trendingmedia.ch",
    status: "Live",
    accent: {
      from: "#ffb454",
      to: "#ff7a3c",
      glow: "rgba(255,160,80,0.45)",
      soft: "rgba(255,160,80,0.12)",
      text: "#ffb86b",
    },
  },
  {
    name: "OneClick Office",
    tag: "Für Coaches & Berater",
    description:
      "Rechnungen, Spesen und Admin-Kram radikal vereinfacht — damit Coaches, Berater und kleine Unternehmen wieder die Arbeit machen, für die sie bezahlt werden.",
    href: "https://landingpage.oneclick-office.ch",
    Icon: FileText,
    domain: "oneclick-office.ch",
    status: "Live",
    accent: {
      from: "#89aacc",
      to: "#4e85bf",
      glow: "rgba(137,170,204,0.45)",
      soft: "rgba(137,170,204,0.12)",
      text: "#a8c2dc",
    },
  },
  {
    name: "Landingpages",
    tag: "Für KMU & Dienstleister",
    description:
      "Hochkonvertierende Landingpages für KMU und lokale Dienstleister. Klarer Fokus: Sichtbarkeit, qualifizierte Anfragen und Resultate, die sich im Kalender messen lassen.",
    href: "https://sichtbarkeit.trendingmedia.ch",
    Icon: Globe,
    domain: "sichtbarkeit.trendingmedia.ch",
    status: "Live",
    accent: {
      from: "#b18cff",
      to: "#e260d8",
      glow: "rgba(177,140,255,0.45)",
      soft: "rgba(177,140,255,0.12)",
      text: "#c9a8ff",
    },
  },
];

export const Products = () => {
  const mode = useSectionMode("products");

  return (
    <section
      id="produkte"
      className={`cosmic ${modeToClass(mode)} relative isolate py-20 md:py-32 c-bg`}
    >
      <SectionBackdrop seed={5} />
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-6 mb-16">
          <div className="max-w-xl">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="block w-8 h-px c-line" />
              <span className="font-mono text-[10px] md:text-[11px] c-text-55 uppercase tracking-[0.3em]">
                Eigene Produkte &middot; 03 Live
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] tracking-[-0.02em] c-text">
              Wir bauen nicht nur.{" "}
              <span className="font-display italic font-normal c-text-95">
                Wir betreiben
              </span>
              <br />
              selbst.
            </h2>
          </div>
          <p className="max-w-md mx-auto text-base md:text-lg c-text-55 leading-relaxed font-light">
            Drei Lösungen, die täglich produktiv im Einsatz sind. Der direkte
            Beweis unseres Vorgehens: zugehört, verstanden, gebaut.
          </p>
        </div>

        {/* Product grid */}
        <div className="grid gap-5 md:gap-6 md:grid-cols-3">
          {products.map((p, i) => {
            const Icon = p.Icon;
            const a = p.accent;
            return (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group c-card-ring relative block h-full rounded-3xl c-surface overflow-hidden"
                style={{
                  ["--card-accent-from" as string]: a.from,
                  ["--card-accent-to" as string]: a.to,
                  ["--card-accent-glow" as string]: a.glow,
                }}
              >
                {/* top accent bar */}
                <span
                  className="absolute inset-x-0 top-0 h-[2px] z-10"
                  style={{ background: `linear-gradient(90deg, ${a.from} 0%, ${a.to} 100%)` }}
                />
                <div className="relative h-full flex flex-col">
                  {/* Mock browser preview panel — always dark */}
                  <div
                    className="relative h-44 md:h-48 overflow-hidden"
                    style={{ backgroundColor: "hsl(218 15% 7%)" }}
                  >
                    {/* grid backdrop tinted with accent */}
                    <div
                      className="absolute inset-0 opacity-60"
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(137,170,204,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(137,170,204,0.04) 1px, transparent 1px)",
                        backgroundSize: "16px 16px",
                      }}
                    />
                    {/* always-visible soft accent wash */}
                    <div
                      className="absolute -top-24 -right-16 w-56 h-56 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-700"
                      style={{
                        background: `radial-gradient(circle, ${a.glow} 0%, transparent 70%)`,
                      }}
                    />
                    <div
                      className="absolute -bottom-20 -left-16 w-44 h-44 rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-700"
                      style={{
                        background: `radial-gradient(circle, ${a.glow} 0%, transparent 70%)`,
                      }}
                    />
                    {/* browser-frame mock */}
                    <div
                      className="absolute inset-x-6 top-7 bottom-8 rounded-xl border bg-white/[0.02] overflow-hidden"
                      style={{ borderColor: a.soft }}
                    >
                      {/* top bar */}
                      <div className="flex items-center gap-1 px-3 py-2 border-b border-white/[0.06]">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: a.from }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
                        <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
                        <span className="ml-3 font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 truncate">
                          {p.domain}
                        </span>
                      </div>
                      {/* product brand mark */}
                      <div className="absolute inset-0 flex items-center justify-center pt-6">
                        <div className="flex flex-col items-center gap-2">
                          <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl">
                            <span
                              className="absolute inset-0 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                              style={{
                                background: `linear-gradient(135deg, ${a.from} 0%, ${a.to} 100%)`,
                                boxShadow: `0 0 24px ${a.glow}`,
                              }}
                            />
                            <span
                              className="relative inline-flex h-[calc(100%-3px)] w-[calc(100%-3px)] items-center justify-center rounded-xl"
                              style={{ backgroundColor: "hsl(218 15% 7%)" }}
                            >
                              <Icon
                                className="h-4 w-4"
                                strokeWidth={1.5}
                                style={{ color: a.text }}
                              />
                            </span>
                          </span>
                          <span className="font-display italic text-base text-white/95 tracking-tight">
                            {p.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* status pill */}
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm px-2.5 py-1">
                      <span className="block h-1 w-1 rounded-full bg-[#60c882] pulse-dot" />
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/65">
                        {p.status}
                      </span>
                    </div>
                    <span
                      className="absolute top-3 right-4 font-mono text-[10px] uppercase tracking-[0.22em]"
                      style={{ color: a.text, opacity: 0.7 }}
                    >
                      {String(i + 1).padStart(2, "0")} / 03
                    </span>
                  </div>

                  {/* Body */}
                  <div className="flex flex-col p-7 md:p-8 flex-1">
                    <span
                      className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 mb-3 font-mono text-[10px] uppercase tracking-[0.22em]"
                      style={{
                        backgroundColor: a.soft,
                        color: a.text,
                      }}
                    >
                      <span
                        className="block h-1 w-1 rounded-full"
                        style={{ backgroundColor: a.from }}
                      />
                      {p.tag}
                    </span>
                    <h3 className="text-xl md:text-2xl font-light tracking-[-0.01em] c-text leading-tight mb-3">
                      {p.name}
                    </h3>
                    <p className="text-sm md:text-[15px] c-text-55 leading-relaxed font-light flex-1">
                      {p.description}
                    </p>
                    <div className="mt-6 pt-5 border-t c-border-faint flex items-center justify-between gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] c-text-45 truncate min-w-0">
                        {p.domain}
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 text-sm font-medium shrink-0 transition-colors"
                        style={{ color: a.text }}
                      >
                        Besuchen
                        <ArrowUpRight
                          className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          strokeWidth={1.75}
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
