import { Quote, Check, X } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

// Mobile-Variante der Referenz/Case-Study inkl. Vorher/Nachher-Vergleich.
const metrics = [
  { label: "Vorher", value: "1 bis 1,5 Arbeitstage Admin pro Monat" },
  { label: "Nachher", value: "rund 2 Stunden Monatsabschluss" },
  { label: "Ergebnis", value: "weniger manuelle Adminarbeit, mehr Zeit für die Klienten" },
];

const vorher = [
  "Word, Excel und Kalender getrennt",
  "Belege und Klienteninfos verteilt",
  "Stunden am Monatsende zusammensuchen",
  "1 bis 1,5 Arbeitstage Admin pro Monat",
];

const nachher = [
  "Zeiten direkt nach dem Termin erfasst",
  "Belege sofort fotografiert",
  "Alles beim Klienten gesammelt",
  "Monatsabschluss in rund 2 Stunden",
];

const MobileCaseStudy = () => (
  <section className="section-padding py-12">
    <div className="section-container max-w-[560px]">
      <ScrollReveal>
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent-deep">
            Beispiel aus der Praxis
          </span>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="rounded-2xl border border-border bg-white p-6 shadow-xl shadow-slate-200/60">
          <div className="flex items-center gap-4">
            <img
              src="/luca.webp"
              alt="Luca Vogel"
              width={256}
              height={385}
              className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-md"
            />
            <div>
              <p className="font-semibold text-text-primary">Luca Vogel</p>
              <p className="text-sm text-text-muted">Sozialpädagogische Familienbegleitung</p>
            </div>
          </div>

          <Quote className="mt-6 h-6 w-6 text-accent" />
          <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
            Vor OneClick Office arbeitete Luca mit Word, Excel, Kalender und einzelnen Belegen an
            verschiedenen Orten. Am Monatsende mussten Stunden, Spesen und Klienteninfos
            zusammengesucht werden.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
            Mit OneClick Office erfasst Luca Zeiten direkt nach dem Termin am Handy, fotografiert
            Belege sofort ab und hat beim Monatsabschluss alles an einem Ort.
          </p>

          <div className="mt-6 space-y-2.5 border-t border-border pt-5">
            {metrics.map((m) => (
              <div key={m.label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                <span className="text-sm font-semibold text-accent-deep sm:w-24 sm:shrink-0">
                  {m.label}
                </span>
                <span className="text-sm text-text-secondary">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Vorher / Nachher */}
      <ScrollReveal delay={0.15}>
        <div className="mt-5 grid gap-4">
          <div className="rounded-2xl border border-border bg-white/70 p-6">
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-text-muted">Vorher</p>
            <ul className="space-y-2.5">
              {vorher.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[15px] text-text-secondary"
                >
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-accent/30 bg-accent-soft/40 p-6">
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-accent-deep">
              Nachher
            </p>
            <ul className="space-y-2.5">
              {nachher.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[15px] font-medium text-text-primary"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
);

export default MobileCaseStudy;
