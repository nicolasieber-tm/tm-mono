const steps = [
  {
    number: "01",
    title: "Zuhören",
    description:
      "Wir sprechen mit Geschäftsführung, Mitarbeitenden und wo es Sinn macht, auch mit Ihren Kunden. Ziel: ein ehrliches Bild davon, wo im Alltag wirklich Aufwand entsteht.",
  },
  {
    number: "02",
    title: "Analysieren",
    description:
      "Wir identifizieren Medienbrüche, manuelle Doppelarbeit und Reibungsverluste. Statt Buzzwords liefern wir eine konkrete Liste der grössten Hebel.",
  },
  {
    number: "03",
    title: "Lösung entwickeln",
    description:
      "Wir entscheiden gemeinsam, was Standard-Software löst, was eigene Software braucht und wo KI tatsächlich Mehrwert schafft, nicht weil es im Trend liegt.",
  },
  {
    number: "04",
    title: "Umsetzen & begleiten",
    description:
      "Wir bauen, integrieren und rollen aus. Danach bleiben wir Ansprechpartner, damit aus dem Projekt ein dauerhaft funktionierender Prozess wird.",
  },
];

export const Process = () => {
  return (
    <section id="vorgehen" className="py-16 md:py-24 bg-secondary/40">
      <div className="container">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">So arbeiten wir</p>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
            Vom echten Problem
            <br />
            zur funktionierenden Lösung.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Unsere Produkte und Projekte entstehen nicht am Whiteboard, sondern
            aus Gesprächen mit Unternehmen, die mit ineffizienten Abläufen
            kämpfen. Genau diesen Weg gehen wir auch mit Ihnen.
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.number} className="bg-card p-8">
              <div className="text-sm font-mono font-medium text-primary">
                {s.number}
              </div>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
