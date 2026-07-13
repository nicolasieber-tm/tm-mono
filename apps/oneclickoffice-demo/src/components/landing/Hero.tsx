import type { CSSProperties, ReactNode } from "react";
import {
  ShieldCheck,
  Plug,
  MapPin,
  Users,
  Zap,
  ArrowDown,
  ArrowRight,
  Play,
  Mail,
} from "lucide-react";
import { hero } from "@/lib/landing-content";

// WICHTIG: Diese Komponente wird beim Build per renderToStaticMarkup vorgerendert
// (scripts/prerender-hero.tsx → in index.html eingesetzt), damit Headline,
// Subheadline und CTA sofort im HTML stehen und AUCH OHNE JavaScript sichtbar
// sind. Darum hier bewusst KEINE Browser-only-Abhängigkeiten:
//   • Mobile/Desktop-Weiche rein per CSS-Breakpoint (md:) statt matchMedia-Hook,
//     damit ohne JS auf jedem Gerät die richtige Variante erscheint.
//   • Reveal-Animation per CSS (.hero-reveal, siehe index.css) statt ScrollReveal
//     (das startet mit opacity:0 und bräuchte JS zum Einblenden).
//   • CTAs sind echte <a href="#…">-Links (funktionieren ohne JS); das Tracking
//     hängt als Progressive Enhancement am onClick — renderToStaticMarkup
//     serialisiert Handler ohnehin nicht, im statischen HTML bleibt nur der Link.

// Passendes Icon je Badge (Desktop-Reihenfolge wie in hero.badges).
const badgeIcons = [ShieldCheck, Plug, MapPin];
// Icons für die vier Mobile-Badges (Reihenfolge wie hero.mobile.badges).
const mobileBadgeIcons = [MapPin, ShieldCheck, Users, Zap];

// CSS-basiertes Reveal (ersetzt ScrollReveal im Hero): sichtbar ohne JS, sanftes
// Einblenden per CSS-Animation, gestaffelt über --reveal-delay.
const Reveal = ({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => (
  <div
    className={`hero-reveal ${className}`}
    style={{ "--reveal-delay": `${delay}s` } as CSSProperties}
  >
    {children}
  </div>
);

// CTA als echter Anker-Link. Der Hero liegt in prod statisch AUSSERHALB der
// React-App (#hero-static, siehe main.tsx/index.html) — darum KEIN React-onClick:
// Smooth-Scroll + Tracking übernimmt ein delegierter Vanilla-Listener in
// index.html, der cta_id/cta_label aus den data-Attributen liest.
const CtaLink = ({
  targetId,
  ctaId,
  label,
  className,
  children,
}: {
  targetId: string;
  ctaId: string;
  label: string;
  className: string;
  children: ReactNode;
}) => (
  <a
    href={`#${targetId}`}
    className={className}
    data-cta-id={ctaId}
    data-cta-label={label}
  >
    {children}
  </a>
);

// Gemeinsamer Rahmen (Section + dezentes Hintergrund-Raster) für beide Varianten.
const HeroShell = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <section
    className={`relative overflow-hidden w-full section-padding pt-28 md:pt-36 pb-10 md:pb-16 ${className}`}
  >
    {/* dezentes Raster im Hintergrund */}
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.025]"
      style={{
        backgroundImage:
          "linear-gradient(hsl(222 47% 11% / 0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(222 47% 11% / 0.05) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    />
    <div className="section-container relative z-10 text-center">{children}</div>
  </section>
);

// Mobile-Hero (≤767px): klarer Value-Prop + ein CTA, der zum schlanken Optin
// scrollt. Am Handy ist der Demo-Zugang per E-Mail der bessere Weg als die
// interaktive Desktop-Demo. Nur <768px sichtbar (md:hidden).
const MobileHero = () => (
  <HeroShell className="md:hidden">
    <Reveal>
      <span className="inline-block px-4 py-2 rounded-full bg-accent-soft text-accent-deep text-xs font-semibold uppercase tracking-[0.12em] mb-8">
        {hero.mobile.kicker}
      </span>
    </Reveal>

    <Reveal delay={0.1}>
      <h1 className="headline-display text-text-primary max-w-[900px] mx-auto mb-6">
        {hero.mobile.headline}
      </h1>
    </Reveal>

    <Reveal delay={0.15}>
      <p className="body-large max-w-[680px] mx-auto mb-4">
        {hero.mobile.subheadline[0]}
      </p>
      <p className="mx-auto mb-8 max-w-[680px] text-base font-medium text-text-primary">
        {hero.mobile.subheadline[1]}
      </p>
    </Reveal>

    <Reveal delay={0.2}>
      <div className="mb-10">
        <CtaLink
          targetId="anfrage"
          ctaId="hero_mobile_optin"
          label={hero.mobile.cta}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:bg-accent-deep sm:w-auto"
        >
          <Mail className="h-5 w-5" />
          {hero.mobile.cta}
        </CtaLink>
      </div>
    </Reveal>

    <Reveal delay={0.25}>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {hero.mobile.badges.map((badge, i) => {
          const Icon = mobileBadgeIcons[i] ?? ShieldCheck;
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
    </Reveal>
  </HeroShell>
);

// Desktop-Hero: zwei CTAs (Live-Demo austesten + Einschätzung). Nur ≥768px
// sichtbar (hidden md:block).
const DesktopHero = () => (
  <HeroShell className="hidden md:block">
    <Reveal>
      <span className="inline-block px-4 py-2 rounded-full bg-accent-soft text-accent-deep text-xs font-semibold uppercase tracking-[0.12em] mb-8">
        {hero.kicker}
      </span>
    </Reveal>

    <Reveal delay={0.1}>
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
    </Reveal>

    <Reveal delay={0.15}>
      <p className="body-large max-w-[680px] mx-auto mb-8">{hero.subheadline}</p>
    </Reveal>

    {/* Zwei CTAs: Live-Demo austesten (scrollt zur Demo) + Einschätzung (scrollt zum Formular) */}
    <Reveal delay={0.2}>
      <div className="mb-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <CtaLink
          targetId="demo"
          ctaId="hero_demo"
          label={hero.ctaPrimary}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:bg-accent-deep sm:w-auto"
        >
          <Play className="h-5 w-5 fill-current" />
          {hero.ctaPrimary}
        </CtaLink>
        <CtaLink
          targetId="anfrage"
          ctaId="hero_anfrage"
          label={hero.ctaSecondary}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-7 py-3.5 text-base font-semibold text-text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent-deep sm:w-auto"
        >
          {hero.ctaSecondary}
          <ArrowRight className="h-5 w-5" />
        </CtaLink>
      </div>
    </Reveal>

    {/* Trust-Badges */}
    <Reveal delay={0.25}>
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
    </Reveal>

    <Reveal delay={0.3}>
      <p className="inline-flex items-center gap-2 text-sm text-text-muted">
        <ArrowDown className="h-4 w-4 animate-bounce" />
        {hero.demoHint}
      </p>
    </Reveal>
  </HeroShell>
);

// Beide Varianten stehen im DOM; welche sichtbar ist, entscheidet der CSS-
// Breakpoint (md:). Das macht den vorgerenderten Hero ohne JS auf jedem Gerät
// korrekt und vermeidet eine JS-Weiche im kritischen Renderpfad.
const Hero = () => (
  <>
    <MobileHero />
    <DesktopHero />
  </>
);

export default Hero;
