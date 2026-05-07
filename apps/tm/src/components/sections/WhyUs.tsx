import { Check, Compass, Handshake, Hammer } from "lucide-react";

const pillars = [
  {
    icon: Compass,
    title: "Wir starten beim Alltag, nicht bei der Technologie.",
    description:
      "Bevor wir über Software sprechen, verstehen wir, wo im Tagesgeschäft Zeit verloren geht: im Büro, vor Ort, im Kundenkontakt.",
  },
  {
    icon: Handshake,
    title: "Wir denken wie Unternehmer.",
    description:
      "Wir betreiben selbst Produkte am Markt. Deshalb wissen wir, was operativ funktioniert und was nur in Slides gut aussieht.",
  },
  {
    icon: Hammer,
    title: "Wir setzen auch um.",
    description:
      "Konzepte ohne Umsetzung helfen niemandem. Wir liefern Strategie, Software und Rollout aus einer Hand, nicht über drei Dienstleister verteilt.",
  },
];

const reasons = [
  {
    title: "KI dort, wo sie wirklich wirkt",
    description:
      "Wir setzen KI nicht als Buzzword ein, sondern dort, wo sie messbar Zeit spart oder bessere Entscheidungen ermöglicht.",
  },
  {
    title: "Strategie + Umsetzung in einer Hand",
    description:
      "Kein Ping-Pong zwischen Beratung, Agentur und IT. Wir analysieren, entwickeln und rollen aus, als ein Team.",
  },
  {
    title: "Eigene Produkte im täglichen Einsatz",
    description:
      "Wir kennen die Realität von SaaS, Support und Skalierung, weil wir selbst Produkte am Markt betreiben.",
  },
  {
    title: "Praxis vor Theorie",
    description:
      "Jede Lösung wird daran gemessen, was sie im Alltag bewirkt: weniger Aufwand, weniger Fehler, mehr Umsatz, nicht hübschere Slides.",
  },
];

export const WhyUs = () => {
  return (
    <section id="warum" className="py-16 md:py-24 border-y border-border">
      <div className="container">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-primary">
            Partner statt Anbieter
          </p>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1]">
            Kein Beratungshaus.
            <br />
            Keine klassische Agentur.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Trending Media begleitet Unternehmen langfristig durch ihre
            Digitalisierung, mit echtem Verständnis für operative Abläufe und
            Lösungen, die im Tagesgeschäft tatsächlich Wirkung zeigen.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title} className="flex flex-col">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-xl font-semibold tracking-tight">
                {p.title}
              </h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 grid gap-4 md:grid-cols-2">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="flex gap-5 rounded-xl border border-border bg-card p-6"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  {r.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {r.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
