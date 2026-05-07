import { Smartphone, Search, MousePointerClick, Clock } from "lucide-react";

const pains = [
  {
    icon: Clock,
    title: "Die Website wirkt nicht mehr zeitgemäss",
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
  return (
    <section className="border-y border-border bg-background py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">Ausgangslage</p>
          <h2 className="text-3xl sm:text-4xl">
            Eine schwache Website kostet Vertrauen. Oft, ohne dass man es merkt.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Diese Punkte sehen wir bei KMU und lokalen Unternehmen am häufigsten.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {pains.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-card"
            >
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg">{p.title}</h3>
              <p className="mt-2 text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
