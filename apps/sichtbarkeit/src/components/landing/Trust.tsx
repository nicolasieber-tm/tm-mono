import { ShieldCheck, MessageSquare, Handshake, Clock } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { useSectionMode, modeToClass } from "@/lib/theme";

const principles = [
  {
    icon: ShieldCheck,
    title: "Ehrliche Einschätzung",
    text: "Wir sagen offen, was sinnvoll ist und was nicht. Auch wenn das bedeutet, dass weniger nötig ist als gedacht.",
  },
  {
    icon: MessageSquare,
    title: "Verständliche Sprache",
    text: "Keine Fachbegriffe, kein Marketing-Kauderwelsch. Sie wissen jederzeit, woran Sie sind.",
  },
  {
    icon: Handshake,
    title: "Persönlicher Kontakt",
    text: "Eine Ansprechperson, die Ihr Unternehmen kennt. Keine Tickets, keine Hotline.",
  },
  {
    icon: Clock,
    title: "Verbindliche Zeitpläne",
    text: "Klare Termine und realistische Zusagen, damit Sie wissen, wann es weitergeht.",
  },
];

export const Trust = () => {
  const mode = useSectionMode("trust");
  return (
    <section className={`cosmic ${modeToClass(mode)} relative overflow-hidden py-24 md:py-32`}>
      <SectionBackdrop seed={5} />
      <div className="relative container-tight">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.32em] c-text-55">
              · So arbeiten wir ·
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light c-text leading-[1.05]">
              Worauf Sie sich
              <span className="block font-display italic font-normal c-text-95 mt-2">
                bei uns verlassen können
              </span>
            </h2>
            <p className="mt-6 c-text-55 max-w-xl mx-auto">
              Anstelle von Beispiel-Referenzen zeigen wir Ihnen lieber, wie wir mit unseren Kunden zusammenarbeiten.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((p, i) => (
            <Reveal key={p.title} delay={i * 70}>
              <div className="c-card-ring c-surface rounded-2xl p-6 h-full">
                <div
                  className="mb-4 grid h-10 w-10 place-items-center rounded-lg c-fill-6"
                  style={{ boxShadow: "0 0 18px -4px rgba(167,139,250,0.35) inset" }}
                >
                  <p.icon className="h-5 w-5" style={{ color: "#a78bfa" }} />
                </div>
                <h3 className="text-base c-text font-medium">{p.title}</h3>
                <p className="mt-2 c-text-55 text-sm leading-relaxed">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-14 text-center text-sm c-text-45 font-mono uppercase tracking-[0.22em]">
            erste referenzen folgen, sobald freigegeben
          </p>
        </Reveal>
      </div>
    </section>
  );
};
