import { ArrowUpRight, Clock, FileText, Globe } from "lucide-react";

const products = [
  {
    name: "AURON",
    tag: "Hauptprodukt",
    description:
      "Intelligente Zeiterfassung für Handwerks- und Servicebetriebe. Entstanden aus dutzenden Gesprächen mit Betrieben, die ihre Stunden bisher auf Zetteln und in Excel verloren haben.",
    href: "https://auron.trendingmedia.ch",
    icon: Clock,
  },
  {
    name: "OneClick Office",
    tag: "Für Coaches & Berater",
    description:
      "Rechnungen, Spesen und Admin-Kram radikal vereinfacht, damit Coaches, Berater und kleine Unternehmen wieder die Arbeit machen können, für die sie bezahlt werden.",
    href: "https://landingpage.oneclick-office.ch",
    icon: FileText,
  },
  {
    name: "Landingpages",
    tag: "Für KMU & Dienstleister",
    description:
      "Hochkonvertierende Landingpages für KMU und lokale Dienstleister. Klarer Fokus: Sichtbarkeit, qualifizierte Anfragen und Resultate, die sich im Kalender messen lassen.",
    href: "https://sichtbarkeit.trendingmedia.ch",
    icon: Globe,
  },
];

export const Products = () => {
  return (
    <section id="produkte" className="py-16 md:py-24">
      <div className="container">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Eigene Produkte</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
            Wir bauen nicht nur.
            <br />
            Wir betreiben selbst.
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            Drei Lösungen, die täglich produktiv im Einsatz sind. Der direkte
            Beweis unseres Vorgehens: zugehört, verstanden, gebaut.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {products.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-accent/40"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary group-hover:bg-accent group-hover:text-primary-foreground transition-colors">
                  <p.icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {p.tag}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">
                {p.name}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                {p.description}
              </p>
              <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                Mehr erfahren
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
