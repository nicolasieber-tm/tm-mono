import nicolaImg from "@/assets/nicola.png";
import timoImg from "@/assets/timo.png";
import mikaImg from "@/assets/mika.png";

const team = [
  {
    name: "Nicola Sieber",
    role: "Co-Founder",
    image: nicolaImg,
    description:
      "Treibt Digitalisierungsprojekte mit klarem Fokus auf Effizienz voran. Denkt lösungsorientiert und übersetzt komplexe Abläufe in Prozesse, die im Alltag wirklich Zeit sparen.",
  },
  {
    name: "Timo Sieber",
    role: "Co-Founder",
    image: timoImg,
    description:
      "Entwickler und zertifizierter KI-Architekt. Verantwortet die Softwarearchitektur hinter unseren Lösungen, von der ersten Skizze bis zum produktiven System.",
  },
  {
    name: "Mika Sieber",
    role: "Co-Founder",
    image: mikaImg,
    description:
      "Sorgt dafür, dass aus Kunden langfristige Partner werden. Erste Ansprechperson für alle Fragen rund um Betreuung, Onboarding und laufende Zusammenarbeit.",
  },
];

export const Team = () => {
  return (
    <section id="team" className="py-16 md:py-24 border-t border-border">
      <div className="container">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-primary">Über uns</p>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1]">
            Die Gesichter hinter Trending Media
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Drei Brüder, ein gemeinsames Ziel: Schweizer KMU mit pragmatischer
            Digitalisierung und KI spürbar entlasten.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {team.map((member) => (
            <div
              key={member.name}
              className="flex flex-col rounded-2xl border border-border bg-card p-8"
            >
              <div className="mb-6 h-32 w-32 overflow-hidden rounded-full bg-secondary">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold tracking-tight">
                {member.name}
              </h3>
              <p className="mt-1 text-sm font-medium text-primary">
                {member.role}
              </p>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {member.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
