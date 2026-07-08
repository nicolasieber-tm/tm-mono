import { Clock, Camera, Monitor } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

// Mobile-Ersatz der "Vom Termin zur Rechnung"-Section: drei konkrete Schritte.
const steps = [
  {
    icon: Clock,
    title: "Nach dem Termin direkt erfassen",
    text: "Du erfasst deine Zeit direkt am Handy, sobald der Termin vorbei ist. Kein Nachtragen am Abend, kein Zusammensuchen im Kalender, keine vergessenen Stunden am Monatsende.",
  },
  {
    icon: Camera,
    title: "Belege sofort abfotografieren",
    text: "Spesen und Belege fotografierst du direkt unterwegs. Alles wird dem richtigen Klienten oder Auftrag zugeordnet, statt später in Mails, Ordnern oder Fotos verloren zu gehen.",
  },
  {
    icon: Monitor,
    title: "Monatsabschluss mit einem Klick vorbereiten",
    text: "Am Desktop siehst du alle erfassten Zeiten, Belege und Leistungen gesammelt an einem Ort. Du prüfst kurz den Monat und erstellst daraus eine fertige Rechnung.",
  },
];

const MobileSteps = () => (
  <section className="section-padding py-12">
    <div className="section-container max-w-[560px]">
      <ScrollReveal>
        <div className="mb-10 text-center">
          <span className="mb-6 inline-block rounded-full bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent-deep">
            Vom Termin zur Rechnung
          </span>
          <h2 className="headline-h2 text-text-primary">In drei Schritten zum Monatsabschluss.</h2>
        </div>
      </ScrollReveal>

      <div className="space-y-4">
        {steps.map((step, i) => (
          <ScrollReveal key={step.title} delay={0.05 * i}>
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent-deep">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-bold text-accent-deep">Schritt {i + 1}</span>
              </div>
              <h3 className="mb-2 mt-4 text-lg font-bold text-text-primary">{step.title}</h3>
              <p className="text-[15px] leading-relaxed text-text-secondary">{step.text}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal delay={0.1}>
        <p className="mx-auto mt-8 max-w-[520px] text-balance text-center text-[15px] font-medium text-text-primary">
          So wird aus täglicher Mini-Erfassung ein sauberer Monatsabschluss, ohne Excel, ohne
          Zettelwirtschaft, ohne stundenlanges Nachbearbeiten.
        </p>
      </ScrollReveal>
    </div>
  </section>
);

export default MobileSteps;
