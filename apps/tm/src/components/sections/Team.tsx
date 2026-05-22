import nicolaImg from "@/assets/nicola.png";
import timoImg from "@/assets/timo.png";
import mikaImg from "@/assets/mika.png";
import { useSectionMode, modeToClass } from "@/lib/theme";
import { SectionBackdrop } from "@/components/SectionBackdrop";

const team = [
  {
    name: "Nicola Sieber",
    role: "Co-Founder",
    image: nicolaImg,
    handle: "Strategy & Operations",
    description:
      "Treibt Digitalisierungsprojekte mit klarem Fokus auf Effizienz voran. Denkt lösungsorientiert und übersetzt komplexe Abläufe in Prozesse, die im Alltag wirklich Zeit sparen.",
  },
  {
    name: "Timo Sieber",
    role: "Co-Founder",
    image: timoImg,
    handle: "Engineering & AI",
    description:
      "Entwickler und zertifizierter KI-Architekt. Verantwortet die Softwarearchitektur hinter unseren Lösungen — von der ersten Skizze bis zum produktiven System.",
  },
  {
    name: "Mika Sieber",
    role: "Co-Founder",
    image: mikaImg,
    handle: "Customer Success",
    description:
      "Sorgt dafür, dass aus Kunden langfristige Partner werden. Erste Ansprechperson für Betreuung, Onboarding und laufende Zusammenarbeit.",
  },
];

export const Team = () => {
  const mode = useSectionMode("team");

  return (
    <section
      id="team"
      className={`cosmic ${modeToClass(mode)} relative isolate py-20 md:py-32 c-bg`}
    >
      <SectionBackdrop seed={7} />
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="hidden sm:block w-8 h-px c-line" />
            <span className="font-mono text-[10px] md:text-[11px] c-text-55 uppercase tracking-[0.3em]">
              Über uns &middot; 03 Co-Founder
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] tracking-[-0.02em] c-text">
            Die Gesichter hinter{" "}
            <span className="font-display italic font-normal c-text-95">
              Trending Media
            </span>
            .
          </h2>
          <p className="mt-6 text-base md:text-lg c-text-55 leading-relaxed max-w-xl mx-auto font-light">
            Drei Brüder, ein gemeinsames Ziel: Schweizer KMU mit pragmatischer
            Digitalisierung und KI spürbar entlasten.
          </p>
        </div>

        {/* Portraits */}
        <div className="grid gap-6 md:gap-8 md:grid-cols-3">
          {team.map((m, i) => (
            <figure key={m.name} className="group c-card-ring relative h-full rounded-3xl c-surface overflow-hidden flex flex-col">
              <div className="relative h-full flex flex-col">
                {/* Portrait */}
                <div
                  className="relative aspect-[4/5] overflow-hidden"
                  style={{ backgroundColor: "hsl(218 15% 7%)" }}
                >
                  <img
                    src={m.image}
                    alt={m.name}
                    className="absolute inset-0 h-full w-full object-cover grayscale opacity-90 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-[1.02]"
                  />
                  {/* gradient overlay for legibility */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
                    }}
                  />
                  {/* handle pill bottom-left */}
                  <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 backdrop-blur-sm px-2.5 py-1">
                    <span className="block h-1 w-1 rounded-full bg-[#60c882] pulse-dot" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/85">
                      {m.handle}
                    </span>
                  </div>
                  {/* index top-right */}
                  <span className="absolute top-3 right-4 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
                    0{i + 1} / 03
                  </span>
                </div>

                {/* Caption */}
                <figcaption className="p-7 md:p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl md:text-3xl font-display italic c-text leading-none">
                    {m.name}
                  </h3>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] c-text-55">
                    {m.role}
                  </p>
                  <p className="mt-4 text-sm c-text-55 leading-relaxed font-light flex-1">
                    {m.description}
                  </p>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};
