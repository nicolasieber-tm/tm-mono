import ScrollReveal from "./ScrollReveal";
import CalEmbed from "./CalEmbed";
import { finalCta } from "@/lib/content";

const FinalCta = () => (
  <section
    id="erstgespraech"
    className="section-padding py-20 md:py-32"
    style={{
      background: "linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%)",
    }}
  >
    <div className="section-container text-center max-w-[920px]">
      <ScrollReveal>
        <span className="inline-block px-4 py-2 rounded-full bg-accent-soft text-accent-deep text-xs font-semibold uppercase tracking-[0.12em] mb-8">
          {finalCta.kicker}
        </span>
        <h2 className="headline-2 text-text-primary mb-4">
          {finalCta.headline}
        </h2>
        <p className="subheadline text-text-secondary w-full max-w-2xl mx-auto mb-8" dangerouslySetInnerHTML={{ __html: finalCta.subheadline }} />
        {finalCta.trustMicrocopy ? (
          <p className="text-sm text-text-muted mb-10">
            {finalCta.trustMicrocopy}
          </p>
        ) : null}
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="max-w-[880px] mx-auto bg-white rounded-2xl border border-border p-2 md:p-4 shadow-xl shadow-slate-200/60 overflow-hidden flex flex-col items-center">
          <div className="w-full min-h-[600px] h-fit md:min-h-[680px] overflow-hidden rounded-xl">
            <CalEmbed />
          </div>
        </div>
        {finalCta.microcopy ? (
          <p className="text-text-muted text-[13px] mt-6">{finalCta.microcopy}</p>
        ) : null}
      </ScrollReveal>
    </div>
  </section>
);

export default FinalCta;
