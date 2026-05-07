import { ShieldCheck, MessageSquare, Handshake, Clock } from "lucide-react";

const principles = [
  {
    icon: ShieldCheck,
    title: "Ehrliche Einschätzung",
    text: "Wir sagen offen, was sinnvoll ist und was nicht. Auch wenn das bedeutet, dass weniger nötig ist als gedacht.",
  },
  {
    icon: MessageSquare,
    title: "Verständliche Sprache",
    text: "Keine Fachbegriffe, kein Marketing-Kauderwelsch. Sie wissen jederzeit, woran Sie sind.",
  },
  {
    icon: Handshake,
    title: "Persönlicher Kontakt",
    text: "Eine Ansprechperson, die Ihr Unternehmen kennt. Keine Tickets, keine Hotline.",
  },
  {
    icon: Clock,
    title: "Verbindliche Zeitpläne",
    text: "Klare Termine und realistische Zusagen, damit Sie wissen, wann es weitergeht.",
  },
];

export const Trust = () => {
  return (
    <section className="border-y border-border bg-background py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">So arbeiten wir</p>
          <h2 className="text-3xl sm:text-4xl">Worauf Sie sich bei uns verlassen können</h2>
          <p className="mt-4 text-muted-foreground">
            Anstelle von Beispiel-Referenzen zeigen wir Ihnen lieber, wie wir mit unseren Kunden zusammenarbeiten.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          Erste Referenzen aus laufenden Projekten folgen, sobald sie freigegeben sind.
        </p>
      </div>
    </section>
  );
};
