import { ArrowRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { ctaStep2 } from "@/lib/content";

const CtaStep2 = () => (
  <section className="section-padding py-2 md:py-4">
    <div className="section-container text-center max-w-[640px]">
      <ScrollReveal>
        <span className="inline-block px-4 py-2 rounded-full bg-accent-soft text-accent-deep text-xs font-semibold uppercase tracking-[0.12em] mb-6">
          {ctaStep2.kicker}
        </span>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <p className="body-large mb-8">{ctaStep2.subheadline}</p>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <a
          href="#erstgespraech"
          className="inline-flex items-center gap-3 bg-accent text-primary-foreground font-semibold rounded-lg px-8 py-4 text-lg hover:bg-accent-deep hover:-translate-y-0.5 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-accent-soft focus:ring-offset-2"
          aria-label={ctaStep2.ctaText}
        >
          {ctaStep2.ctaText}
          <ArrowRight className="w-5 h-5" />
        </a>
        <p className="text-text-muted text-sm mt-4">{ctaStep2.trustMicrocopy}</p>
      </ScrollReveal>
    </div>
  </section>
);

export default CtaStep2;
