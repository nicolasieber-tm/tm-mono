import { ArrowRight, Quote } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { testimonial } from "@/lib/landing-content";

const Testimonial = () => (
  <section className="section-padding py-16 md:py-24">
    <div className="section-container max-w-[820px]">
      <ScrollReveal>
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent-deep">
            {testimonial.kicker}
          </span>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="rounded-2xl border border-border bg-white p-6 shadow-xl shadow-slate-200/60 md:p-10">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="h-24 w-24 flex-shrink-0 rounded-2xl object-cover shadow-md md:h-28 md:w-28"
            />
            <div className="flex-1 text-center md:text-left">
              <Quote className="mx-auto mb-3 h-7 w-7 text-accent md:mx-0" />
              <p className="text-lg leading-relaxed text-text-primary md:text-xl">
                „{testimonial.quote}"
              </p>
              <div className="mt-5">
                <p className="font-semibold text-text-primary">{testimonial.name}</p>
                <p className="text-sm text-text-muted">{testimonial.role}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-7">
            <p className="mb-5 text-center text-sm font-medium text-text-muted">
              Was sich für {testimonial.name.split(" ")[0]} verändert hat
            </p>
            <div className="space-y-2.5 text-sm md:text-[15px]">
              {testimonial.transformation.map((t) => (
                <div
                  key={t.after}
                  className="flex flex-col items-center gap-1.5 rounded-xl bg-bg-elevated/60 px-4 py-3 text-center sm:flex-row sm:gap-4 sm:text-left"
                >
                  <span className="text-balance text-text-muted sm:flex-1 sm:text-right">
                    {t.before}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 rotate-90 text-accent sm:rotate-0" />
                  <span className="text-balance font-semibold text-text-primary sm:flex-1">
                    {t.after}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
);

export default Testimonial;
