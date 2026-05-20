import { Check } from "lucide-react";
import { BrowserMockup } from "./BrowserMockup";
import { Reveal } from "@/components/ui/reveal";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { useSectionMode, modeToClass } from "@/lib/theme";

const points = [
  "Auf den ersten Blick verständlich, was Sie anbieten",
  "Klar, wie und wo man Sie erreicht",
  "Auf Handy, Tablet und Desktop gleich gut nutzbar",
  "Bessere Auffindbarkeit bei Google, auch lokal",
  "Schnelle Ladezeiten, die Besucher nicht verlieren",
  "Ein Auftritt, der zu Ihrem Unternehmen passt",
];

export const Solution = () => {
  const mode = useSectionMode("solution");
  return (
    <section
      id="leistungen"
      className={`cosmic ${modeToClass(mode)} relative overflow-hidden py-24 md:py-32`}
    >
      <SectionBackdrop seed={2} />
      <div className="relative container-tight grid gap-14 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.32em] c-text-55">
              · Unser Ansatz ·
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light c-text leading-[1.05]">
              Klar zeigen, was Sie tun.
              <span className="block font-display italic font-normal c-text-95 mt-2">
                Einfach erreichbar sein.
              </span>
              <span className="block c-text-70 text-2xl sm:text-3xl mt-2 font-light">
                Online besser gefunden werden.
              </span>
            </h2>
            <p className="mt-6 c-text-70 leading-relaxed max-w-lg">
              Wir bauen Websites, die Ihr Unternehmen verständlich darstellen und es Besuchern leicht
              machen, Sie zu kontaktieren. Ohne Schnickschnack, ohne Fachjargon. Ausgerichtet auf das,
              was im Alltag wirklich zählt.
            </p>

            <ul className="mt-8 space-y-3">
              {points.map((p, i) => (
                <Reveal as="li" key={p} delay={i * 60} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full"
                    style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)" }}
                  >
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </span>
                  <span className="c-text-85">{p}</span>
                </Reveal>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] c-text-45">
                Vorher
              </div>
              <BrowserMockup variant="outdated" className="opacity-80" />
            </div>
            <div className="lg:mt-12">
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "#a78bfa" }}>
                Nachher
              </div>
              <BrowserMockup variant="modern" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
