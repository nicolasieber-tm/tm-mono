import { ShieldCheck, Plug, MapPin, ArrowDown } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { hero } from "@/lib/landing-content";

// Passendes Icon je Badge (Reihenfolge wie in landing-content.badges).
const badgeIcons = [ShieldCheck, Plug, MapPin];

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

      {/* Trust-Badges */}
      <ScrollReveal delay={0.2}>
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

      <ScrollReveal delay={0.25}>
        <p className="inline-flex items-center gap-2 text-sm text-text-muted">
          <ArrowDown className="h-4 w-4 animate-bounce" />
          {hero.demoHint}
        </p>
      </ScrollReveal>
    </div>
  </section>
);

export default Hero;
