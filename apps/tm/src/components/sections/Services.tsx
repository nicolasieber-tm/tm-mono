import { Bot, Code2, Cpu, Workflow } from "lucide-react";

const services = [
  {
    icon: Workflow,
    title: "Prozesse digitalisieren",
    description:
      "Wir machen sichtbar, wo in Ihrem Alltag Aufwand entsteht. Zettel, Excel-Listen und Medienbrüche ersetzen wir durch saubere digitale Abläufe.",
  },
  {
    icon: Bot,
    title: "KI & Automatisierung mit Substanz",
    description:
      "Wir integrieren KI dort, wo sie konkret Mehrwert schafft: vom internen Assistenten bis zur automatisierten Verarbeitung wiederkehrender Aufgaben.",
  },
  {
    icon: Cpu,
    title: "Massgeschneiderte Software",
    description:
      "Wenn Standard-Software nicht passt, bauen wir genau das Werkzeug, das in Ihrem Betrieb fehlt: stabil, wartbar und zum Mitwachsen gemacht.",
  },
  {
    icon: Code2,
    title: "Web & Landingpages",
    description:
      "Performante Webauftritte, die Sichtbarkeit in Anfragen verwandeln, mit klarer Conversion-Logik statt Pixel-Spielerei.",
  },
];

export const Services = () => {
  return (
    <section id="leistungen" className="py-16 md:py-24">
      <div className="container">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Leistungen</p>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
            Strategie, Software,
            <br />
            Umsetzung. Ein Team.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Vier Bereiche, in denen wir Unternehmen begleiten. Immer mit dem
            gleichen Anspruch: spürbar weniger Aufwand, mehr Qualität, mehr Zeit
            für das Eigentliche.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
          {services.map((s) => (
            <div
              key={s.title}
              className="bg-card p-8 transition-colors hover:bg-secondary/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
