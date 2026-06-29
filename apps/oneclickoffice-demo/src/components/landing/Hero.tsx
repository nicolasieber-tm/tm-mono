import { ShieldCheck, Plug, MapPin, ArrowDown, ArrowRight, Play } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { hero } from "@/lib/landing-content";
import { track } from "@/lib/analytics";

// Passendes Icon je Badge (Reihenfolge wie in landing-content.badges).
const badgeIcons = [ShieldCheck, Plug, MapPin];

// CTA-Klick tracken und sanft zur Ziel-Section scrollen (Demo / Anfrage-Formular).
const goToSection = (id: string, ctaId: string, label: string) => () => {
  track("cta_click", { cta_id: ctaId, cta_label: label });
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const Hero = () => (
  <section className="relative overflow-hidden w-full section-padding pt-28 md:pt-36 pb-10 md:pb-16">
    {/* dezentes Raster im Hintergrund */}
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.025]"
      style={{
        backgroundImage:
          "linear-gradient(hsl(222 47% 11% / 0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(222 47% 11% / 0.05) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    />

    <div className="section-container relative z-10 text-center">
      <ScrollReveal>
        <span className="inline-block px-4 py-2 rounded-full bg-accent-soft text-accent-deep text-xs font-semibold uppercase tracking-[0.12em] mb-8">
          {hero.kicker}
        </span>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <h1 className="headline-display text-text-primary max-w-[900px] mx-auto mb-6">
          {hero.headlineLines.map((line, i) => (
            <span key={i} className="block">
              {line.accent ? (
                <span className="text-accent">{line.text}</span>
              ) : (
                line.text
              )}
            </span>
          ))}
        </h1>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <p className="body-large max-w-[680px] mx-auto mb-8">{hero.subheadline}</p>
      </ScrollReveal>

      {/* Zwei CTAs: Live-Demo austesten (scrollt zur Demo) + Einschätzung (scrollt zum Formular) */}
      <ScrollReveal delay={0.2}>
        <div className="mb-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={goToSection("demo", "hero_demo", hero.ctaPrimary)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:bg-accent-deep sm:w-auto"
          >
            <Play className="h-5 w-5 fill-current" />
            {hero.ctaPrimary}
          </button>
          <button
            type="button"
            onClick={goToSection("anfrage", "hero_anfrage", hero.ctaSecondary)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-7 py-3.5 text-base font-semibold text-text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent-deep sm:w-auto"
          >
            {hero.ctaSecondary}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </ScrollReveal>

      {/* Trust-Badges */}
      <ScrollReveal delay={0.25}>
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {hero.badges.map((badge, i) => {
            const Icon = badgeIcons[i] ?? ShieldCheck;
            return (
              <span
                key={badge}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-4 py-2 text-sm font-medium text-text-secondary shadow-sm"
              >
                <Icon className="h-4 w-4 text-accent" />
                {badge}
              </span>
            );
          })}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.3}>
        <p className="inline-flex items-center gap-2 text-sm text-text-muted">
          <ArrowDown className="h-4 w-4 animate-bounce" />
          {hero.demoHint}
        </p>
      </ScrollReveal>
    </div>
  </section>
);

export default Hero;
