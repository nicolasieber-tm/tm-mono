import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, CalendarCheck, Check, Clock, FileWarning } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import VideoPlayer from "@/components/VideoPlayer";
import BookingCta from "@/components/BookingCta";
import Testimonial from "@/components/Testimonial";
import ScrollReveal from "@/components/ScrollReveal";
import { video } from "@/lib/content";
import { track } from "@/lib/analytics";

/**
 * Video-Seite (Route "/video") — erreichbar nach dem Opt-in UND über den Link
 * aus der E-Mail. Deshalb bewusst OHNE Zugangsprüfung: ein Gate würde genau die
 * ausschliessen, die später über die Mail zurückkommen.
 *
 * Alles unter dem Video ist eine Zusammenfassung des Videos — für die, die
 * nicht bis zum Ende schauen. Der Aufbau folgt dem Script: woher der Aufwand
 * kommt, wie wir vorgehen, was dabei herauskommen kann, das Beispiel Luca,
 * der Ablauf, Termin.
 */

const COST_ICONS = [Clock, AlertTriangle, FileWarning];

const Video = () => {
  const [name, setName] = useState("");

  useEffect(() => {
    track("video_page_view", { page: "video" });
    try {
      setName(sessionStorage.getItem("oco_lead_name") ?? "");
    } catch {
      /* Privatmodus — dann eben ohne persönliche Anrede */
    }
  }, []);

  const firstName = name.trim().split(/\s+/)[0] ?? "";

  return (
    <div className="min-h-screen bg-background">
      <div
        style={{
          background: "linear-gradient(180deg, hsl(214 95% 93% / 0.6) 0%, hsl(0 0% 100%) 100%)",
        }}
      >
        <SiteHeader />

        {/* ---------- Video ---------- */}
        <section className="section-container pb-4 pt-8 md:pt-12">
          <div className="mx-auto max-w-[860px] text-center">
            {/* Persönliche Anrede sitzt im Kicker, nicht in der Headline: so
                bleibt die Headline beim Umtexten unangetastet. */}
            <span className="lp-kicker">
              {firstName ? `${firstName}, dein Video ist freigeschaltet` : video.kicker}
            </span>
            <h1 className="headline-h2 mt-5 text-balance">{video.headline}</h1>
            <p className="body-large mx-auto mt-4 max-w-[600px]">{video.subheadline}</p>
          </div>

          <div className="mx-auto mt-8 max-w-[900px]">
            <VideoPlayer />
          </div>

          {/* Sofort-Weg zur Buchung. Das Widget-Script wird weiter unten von
              BookingCta geladen und bindet per Event-Delegation alle Links mit
              href="#book-widget" ein — also auch diesen hier. */}
          <div className="mx-auto mt-7 max-w-[520px] text-center">
            <a
              href="#book-widget"
              onClick={() =>
                track("cta_click", {
                  cta_id: "booking_under_video",
                  cta_label: video.ctaUnderVideo.label,
                })
              }
              className="btn-primary"
            >
              <CalendarCheck className="h-5 w-5" />
              {video.ctaUnderVideo.label}
            </a>
            <p className="mt-3 text-sm text-text-muted">{video.ctaUnderVideo.note}</p>
          </div>
        </section>
      </div>

      <main>
        {/* ---------- 1. Woher der Aufwand kommt ---------- */}
        <section className="section-container py-14 md:py-20">
          <ScrollReveal>
            <div className="mx-auto max-w-[760px] text-center">
              <span className="lp-kicker">{video.problem.kicker}</span>
              <h2 className="headline-h2 mt-5">{video.problem.headline}</h2>
              <p className="body-large mt-5">{video.problem.intro}</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.08}>
            <blockquote className="mx-auto mt-10 max-w-[720px] border-l-[3px] border-accent bg-accent-soft/40 px-6 py-5 text-lg font-medium leading-relaxed text-text-primary md:text-xl">
              {video.problem.quote}
            </blockquote>
          </ScrollReveal>

          <ScrollReveal delay={0.12}>
            <p className="mx-auto mt-8 max-w-[760px] text-[0.9375rem] leading-relaxed text-text-secondary md:text-base">
              {video.problem.growth}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.16}>
            <div className="mx-auto mt-10 grid max-w-[900px] gap-4 md:grid-cols-3">
              {video.problem.costs.map((cost, i) => {
                const Icon = COST_ICONS[i] ?? Clock;
                return (
                  <div key={cost.title} className="rounded-2xl border border-border bg-white p-5">
                    <Icon className="h-5 w-5 text-accent" />
                    <h3 className="mt-3 font-semibold text-text-primary">{cost.title}</h3>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-text-secondary">
                      {cost.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </section>

        {/* ---------- 2. Wie wir vorgehen ---------- */}
        <section className="border-y border-border bg-bg-elevated py-14 md:py-20">
          <div className="section-container">
            <ScrollReveal>
              <div className="mx-auto max-w-[760px] text-center">
                <span className="lp-kicker">{video.approach.kicker}</span>
                <h2 className="headline-h2 mt-5 text-balance">{video.approach.headline}</h2>
                <p className="body-large mt-5">{video.approach.intro}</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.08}>
              <ol className="mx-auto mt-9 max-w-[720px] space-y-3">
                {video.approach.questions.map((q, i) => (
                  <li
                    key={q}
                    className="flex items-start gap-4 rounded-2xl border border-border bg-white p-5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent-deep">
                      {i + 1}
                    </span>
                    <span className="text-[1.0625rem] font-medium leading-relaxed text-text-primary">
                      {q}
                    </span>
                  </li>
                ))}
              </ol>
            </ScrollReveal>

            {/* Nimmt den Verdacht weg, hier solle Software verkauft werden. */}
            <ScrollReveal delay={0.12}>
              <div className="mx-auto mt-8 max-w-[720px] rounded-2xl border-2 border-accent/25 bg-white p-6 md:p-7">
                <h3 className="text-lg font-bold text-text-primary md:text-xl">
                  {video.approach.noSalesTitle}
                </h3>
                <p className="mt-2.5 leading-relaxed text-text-secondary">
                  {video.approach.noSalesText}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ---------- 3. Was dabei herauskommt ---------- */}
        <section className="section-container py-14 md:py-20">
          <ScrollReveal>
            <div className="mx-auto max-w-[760px] text-center">
              <span className="lp-kicker">{video.solutions.kicker}</span>
              <h2 className="headline-h2 mt-5 text-balance">{video.solutions.headline}</h2>
            </div>
          </ScrollReveal>

          <div className="mx-auto mt-9 grid max-w-[900px] gap-4 md:grid-cols-2">
            {video.solutions.items.map((item, i) => (
              <ScrollReveal key={item.title} delay={0.06 * i}>
                <div className="h-full rounded-2xl border border-border bg-white p-6">
                  <h3 className="flex items-start gap-2.5 font-semibold text-text-primary">
                    <Check className="mt-0.5 h-[18px] w-[18px] shrink-0 text-accent" strokeWidth={3} />
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-text-secondary">
                    {item.text}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.14}>
            <p className="mx-auto mt-9 max-w-[680px] text-center text-lg font-medium leading-relaxed text-text-primary">
              {video.solutions.closing}
            </p>
          </ScrollReveal>
        </section>

        {/* ---------- 4. Beispiel Luca ---------- */}
        <section className="border-y border-border bg-bg-elevated py-14 md:py-20">
          <div className="section-container">
            <ScrollReveal>
              <div className="mx-auto max-w-[760px] text-center">
                <span className="lp-kicker">{video.example.kicker}</span>
                <h2 className="headline-h2 mt-5 text-balance">{video.example.headline}</h2>
                <p className="body-large mt-5">{video.example.intro}</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.08}>
              <ul className="mx-auto mt-9 max-w-[720px] space-y-3">
                {video.example.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
                    <span className="leading-relaxed text-text-secondary">{point}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            <ScrollReveal delay={0.12}>
              <div className="mx-auto mt-9 max-w-[720px]">
                <Testimonial />
              </div>
            </ScrollReveal>

            {/* Ohne diese Einschränkung liest sich der Abschnitt als Produktpitch. */}
            <ScrollReveal delay={0.16}>
              <div className="mx-auto mt-8 max-w-[720px] rounded-2xl border border-dashed border-accent/40 bg-white p-6 md:p-7">
                <h3 className="text-lg font-bold text-text-primary md:text-xl">
                  {video.example.disclaimerTitle}
                </h3>
                <p className="mt-2.5 leading-relaxed text-text-secondary">
                  {video.example.disclaimerText}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ---------- 5. Ablauf ---------- */}
        <section className="section-container py-14 md:py-20">
          <ScrollReveal>
            <div className="mx-auto max-w-[760px] text-center">
              <span className="lp-kicker">{video.process.kicker}</span>
              <h2 className="headline-h2 mt-5">{video.process.headline}</h2>
            </div>
          </ScrollReveal>

          <div className="mx-auto mt-9 grid max-w-[980px] gap-5 md:grid-cols-3">
            {video.process.items.map((step, i) => (
              <ScrollReveal key={step.title} delay={0.08 * i}>
                <div className="h-full rounded-2xl border border-border bg-white p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-text-primary">{step.title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-text-secondary">
                    {step.text}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ---------- 6. Terminbuchung ---------- */}
        <BookingCta />
      </main>

      <SiteFooter />
    </div>
  );
};

export default Video;
