import { Check } from "lucide-react";
import { BrowserMockup } from "./BrowserMockup";

const points = [
  "Auf den ersten Blick verständlich, was Sie anbieten",
  "Klar, wie und wo man Sie erreicht",
  "Auf Handy, Tablet und Desktop gleich gut nutzbar",
  "Bessere Auffindbarkeit bei Google, auch lokal",
  "Schnelle Ladezeiten, die Besucher nicht verlieren",
  "Ein Auftritt, der zu Ihrem Unternehmen passt",
];

export const Solution = () => {
  return (
    <section id="leistungen" className="bg-gradient-soft py-20 md:py-28">
      <div className="container grid gap-14 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">Unser Ansatz</p>
          <h2 className="text-3xl sm:text-4xl">
            Klar zeigen, was Sie tun. Einfach erreichbar sein. Online besser gefunden werden.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Wir bauen Websites, die Ihr Unternehmen verständlich darstellen und es Besuchern leicht
            machen, Sie zu kontaktieren. Ohne Schnickschnack, ohne Fachjargon. Ausgerichtet auf das,
            was im Alltag wirklich zählt.
          </p>

          <ul className="mt-8 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span className="text-foreground/90">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Vorher</div>
            <BrowserMockup variant="outdated" className="opacity-80" />
          </div>
          <div className="lg:mt-12">
            <div className="mb-3 text-xs font-medium uppercase tracking-wider text-primary">Nachher</div>
            <BrowserMockup variant="modern" className="shadow-elevated" />
          </div>
        </div>
      </div>
    </section>
  );
};
