import { Check } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { useSectionMode, modeToClass } from "@/lib/theme";

const groups = [
  { num: "I", title: "Lokale Dienstleister", text: "Handwerk, Gewerbe, Praxen, Kanzleien — Betriebe, die in ihrer Region sichtbar sein müssen." },
  { num: "II", title: "Veralteter Auftritt", text: "Ihre Website existiert, fühlt sich aber nicht mehr nach Ihrem Unternehmen an." },
  { num: "III", title: "Noch keine Website", text: "Sie starten ohne Altlasten — wir bauen den Auftritt von Grund auf richtig auf." },
];

export const ForWhom = () => {
  const mode = useSectionMode("forwhom");
  return (
    <section
      id="fuer-wen"
      className={`cosmic ${modeToClass(mode)} relative overflow-hidden py-24 md:py-32`}
    >
      <SectionBackdrop seed={4} />
      <div className="relative container-tight">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.32em] c-text-55">
              · Für wen ·
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light c-text leading-[1.05]">
              Gemacht für{" "}
              <span className="font-display italic font-normal c-text-95">KMU</span> und
              lokale Unternehmen
              <span className="block c-text-70 text-2xl sm:text-3xl mt-2 font-light">
                in der Schweiz.
              </span>
            </h2>
            <p className="mt-6 c-text-55 max-w-xl mx-auto">
              Wir arbeiten bewusst mit kleineren, inhabergeführten Betrieben. Dort, wo eine bessere
              Website direkt mehr Anfragen und weniger Erklärungsbedarf bedeutet.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {groups.map((g, i) => (
            <Reveal key={g.title} delay={i * 90}>
              <div
                className="c-card-lift c-surface rounded-2xl p-7 h-full group"
                style={{
                  ["--card-accent-glow" as string]: "rgba(167,139,250,0.22)",
                }}
              >
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="relative inline-block">
                    <span
                      className="c-icon-halo"
                      aria-hidden
                      style={{
                        inset: "auto",
                        width: "180px",
                        height: "180px",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                    <span
                      className="c-icon-float relative font-display italic text-4xl font-normal inline-block leading-none pr-2 pt-1"
                      style={{
                        background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {g.num}
                    </span>
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] c-text-45">
                    Zielgruppe
                  </span>
                </div>
                <h3 className="text-xl c-text font-medium">{g.title}</h3>
                <p className="mt-3 c-text-55 text-sm leading-relaxed">{g.text}</p>
                <div className="mt-5 flex items-center gap-2 c-text-45 text-xs">
                  <Check className="h-3.5 w-3.5" style={{ color: "#a78bfa" }} />
                  Passend für Sie
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
