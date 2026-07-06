import {
  Smartphone,
  MousePointerClick,
  FileCheck2,
  ArrowRight,
  Camera,
  LayoutGrid,
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { aha } from "@/lib/landing-content";

const steps = [
  { icon: Smartphone, label: "Unterwegs erfasst" },
  { icon: MousePointerClick, label: "1 Klick" },
  { icon: FileCheck2, label: "Fertig abgerechnet" },
];

// Icons zu den ergänzenden Vorteilen (Reihenfolge = aha.benefits).
const benefitIcons = [Camera, LayoutGrid];

const AhaTransition = () => (
  <section className="section-padding py-16 md:py-24">
    <div className="section-container max-w-[760px] text-center">
      <ScrollReveal>
        <span className="mb-6 inline-block rounded-full bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent-deep">
          {aha.kicker}
        </span>
        <h2 className="headline-h2 mb-4 text-text-primary">{aha.headline}</h2>
        <p className="body-large mx-auto mb-12 max-w-[620px]">{aha.subheadline}</p>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="flex items-start justify-center gap-1.5 md:gap-5">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-start gap-1.5 md:gap-5">
              <div className="flex w-[4.5rem] shrink-0 flex-col items-center gap-2 md:w-auto">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent-deep">
                  <step.icon className="h-6 w-6" />
                </span>
                <span className="text-xs font-semibold leading-tight text-text-primary md:text-sm">
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="mt-[18px] h-5 w-5 shrink-0 text-text-muted" />
              )}
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Nur Mobile (md:hidden = ≤767px, gleicher Breakpoint wie die Live-Demo):
          Handy-Besucher sehen in der Demo die Erfassung – hier zeigen wir, wie der
          "1 Klick"-Abrechnungs-Moment am Desktop aussieht. */}
      <ScrollReveal delay={0.15}>
        <figure className="mx-auto mt-12 max-w-[420px] md:hidden">
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-2xl shadow-slate-300/50">
            <div className="flex items-center gap-2 border-b border-border bg-bg-elevated px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <div className="mx-auto max-w-[200px] flex-1 rounded-md border border-border bg-white px-2 py-0.5 text-center text-[11px] text-text-muted">
                {aha.mobileShot.browserUrl}
              </div>
            </div>
            <img
              src={aha.mobileShot.src}
              alt={aha.mobileShot.alt}
              loading="lazy"
              className="block w-full"
            />
          </div>
          <figcaption className="mt-3 text-sm text-text-muted">
            {aha.mobileShot.caption}
          </figcaption>
        </figure>
      </ScrollReveal>

      {/* Ergänzende Vorteile neben der Abrechnung: Spesen + zentrale Übersicht. */}
      <ScrollReveal delay={0.2}>
        <div className="mt-14 grid gap-4 text-left sm:grid-cols-2">
          {aha.benefits.map((benefit, i) => {
            const Icon = benefitIcons[i];
            return (
              <div
                key={benefit.title}
                className="rounded-2xl border border-border bg-white/70 p-6"
              >
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-deep">
                  {Icon && <Icon className="h-6 w-6" />}
                </span>
                <h3 className="mb-1.5 text-lg font-bold text-text-primary">
                  {benefit.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-text-secondary">
                  {benefit.text}
                </p>
              </div>
            );
          })}
        </div>
      </ScrollReveal>
    </div>
  </section>
);

export default AhaTransition;
