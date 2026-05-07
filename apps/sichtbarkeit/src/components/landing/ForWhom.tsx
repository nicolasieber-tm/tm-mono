import { Check } from "lucide-react";

const groups = [
  "Lokale Dienstleister und Gewerbe",
  "Betriebe mit veralteter Website",
  "Unternehmen, die noch keine Website haben",
];

export const ForWhom = () => {
  return (
    <section className="bg-gradient-soft py-20 md:py-28">
      <div className="container grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div>
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">Für wen</p>
          <h2 className="text-3xl sm:text-4xl">
            Gemacht für KMU und lokale Unternehmen in der Schweiz.
          </h2>
          <p className="mt-5 text-muted-foreground">
            Wir arbeiten bewusst mit kleineren, inhabergeführten Betrieben. Dort, wo eine bessere
            Website direkt mehr Anfragen und weniger Erklärungsbedarf bedeutet.
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {groups.map((g) => (
            <li
              key={g}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className="font-medium">{g}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
