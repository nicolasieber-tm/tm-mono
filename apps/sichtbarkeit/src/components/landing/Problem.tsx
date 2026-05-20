import { Smartphone, Search, MousePointerClick, Clock } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { useSectionMode, modeToClass } from "@/lib/theme";

const pains = [
  {
    icon: Clock,
    title: "Wirkt nicht mehr zeitgemäss",
    text: "Ein veralteter Auftritt lässt selbst gute Unternehmen weniger professionell erscheinen, als sie sind.",
  },
  {
    icon: Smartphone,
    title: "Auf dem Handy schwer nutzbar",
    text: "Die meisten Besucher kommen heute mobil. Ist die Seite dort unübersichtlich, springen sie schnell ab.",
  },
  {
    icon: Search,
    title: "Bei Google kaum auffindbar",
    text: "Wer Sie online nicht findet, kann Sie auch nicht anfragen. Gerade bei lokaler Suche entscheidend.",
  },
  {
    icon: MousePointerClick,
    title: "Unklar, wie man Sie erreicht",
    text: "Versteckte Kontaktdaten und unklare Angebote führen dazu, dass interessierte Besucher wieder gehen.",
  },
];

export const Problem = () => {
  const mode = useSectionMode("problem");
  return (
    <section
      id="ausgangslage"
      className={`cosmic ${modeToClass(mode)} relative overflow-hidden py-24 md:py-32`}
    >
      <SectionBackdrop seed={1} />
      <div className="relative container-tight">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.32em] c-text-55">
              · Ausgangslage ·
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light c-text leading-[1.05]">
              Eine schwache Website kostet{" "}
              <span className="font-display italic font-normal">Vertrauen</span>.
              <span className="block c-text-70 text-2xl sm:text-3xl md:text-4xl mt-3 font-light">
                Oft, ohne dass man es merkt.
              </span>
            </h2>
            <p className="mt-6 c-text-55 max-w-xl mx-auto">
              Diese Punkte sehen wir bei KMU und lokalen Unternehmen am häufigsten.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-5 sm:grid-cols-2">
          {pains.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <div className="c-card-ring c-surface rounded-2xl p-6 h-full">
                <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl c-fill-6">
                  <p.icon className="h-5 w-5" style={{ color: "#a78bfa" }} />
                </div>
                <h3 className="text-lg c-text font-medium">{p.title}</h3>
                <p className="mt-2 c-text-55 text-sm leading-relaxed">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
