import { AlertTriangle, FileSpreadsheet, Repeat2, UserCog } from "lucide-react";

const pains = [
  {
    icon: FileSpreadsheet,
    title: "Excel-Listen, die niemand mehr durchblickt",
    description:
      "Daten leben in fünf Tabellen, drei Mailboxen und einem Ordner-Chaos. Jede Auswertung ist Handarbeit.",
  },
  {
    icon: Repeat2,
    title: "Doppelte Erfassung in jedem System",
    description:
      "Die gleichen Informationen werden täglich mehrfach getippt: im CRM, in der Buchhaltung, im Projekt-Tool.",
  },
  {
    icon: UserCog,
    title: "Wissen, das nur in einem Kopf existiert",
    description:
      "Wenn diese eine Person Ferien hat, steht der halbe Betrieb. Prozesse sind nirgendwo dokumentiert.",
  },
  {
    icon: AlertTriangle,
    title: "KI-Versprechen, die im Alltag nichts bringen",
    description:
      "Tools wurden eingeführt, aber niemand nutzt sie. Der Aufwand ist gleich geblieben, die Lizenzkosten nicht.",
  },
];

export const ProblemMirror = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Kommt Ihnen bekannt vor?</p>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
            Die typischen Reibungs&shy;verluste
            <br />
            in Schweizer KMU.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Wir hören diese Punkte in fast jedem Erstgespräch. Sie sind kein
            Zeichen schlechter Organisation, sondern dafür, dass Ihr Betrieb
            gewachsen ist, schneller als die Werkzeuge.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {pains.map((p) => (
            <div
              key={p.title}
              className="flex gap-5 rounded-xl border border-border bg-card p-6"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <p.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
