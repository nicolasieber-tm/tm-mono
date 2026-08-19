import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
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
 * Unter dem Video steht das Wichtigste zum Nachlesen (viele schauen nicht zu
 * Ende) und am Ende die Terminbuchung — die eigentliche Conversion dieser Seite.
 */
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
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, hsl(214 95% 93% / 0.6) 0%, hsl(0 0% 100%) 40%)",
      }}
    >
      <SiteHeader />

      <main>
        {/* ---------- Video ---------- */}
        <section className="section-container pt-8 md:pt-12">
          <div className="mx-auto max-w-[860px] text-center">
            {/* Persönliche Anrede sitzt im Kicker, nicht in der Headline: so
                bleibt die Headline beim Umtexten unangetastet und es kann keine
                schiefe Gross-/Kleinschreibung entstehen. */}
            <span className="lp-kicker">
              {firstName ? `${firstName}, dein Video ist freigeschaltet` : video.kicker}
            </span>
            <h1 className="headline-h2 mt-5 text-balance">{video.headline}</h1>
            <p className="body-large mx-auto mt-4 max-w-[600px]">{video.subheadline}</p>
          </div>

          <div className="mx-auto mt-8 max-w-[880px]">
            <VideoPlayer />
          </div>
        </section>

        {/* ---------- Ist-Situation vs. Wunschsituation ---------- */}
        <section className="section-container py-14 md:py-20">
          <ScrollReveal>
            <div className="mx-auto max-w-[720px] text-center">
              <span className="lp-kicker">{video.summary.kicker}</span>
              <h2 className="headline-h2 mt-5">{video.summary.headline}</h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="mx-auto mt-9 grid max-w-[900px] gap-4 md:grid-cols-2 md:gap-5">
              {/* Vorher */}
              <div className="rounded-2xl border border-border bg-bg-elevated p-5 md:p-7">
                <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.1em] text-text-muted">
                  {video.summary.beforeTitle}
                </h3>
                <ul className="space-y-4">
                  {video.summary.rows.map((row) => (
                    <li key={row.before} className="flex gap-3">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" strokeWidth={2.5} />
                      <span className="text-[0.9375rem] leading-relaxed text-text-secondary">
                        {row.before}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nachher */}
              <div className="rounded-2xl border-2 border-accent/30 bg-white p-5 shadow-lg shadow-slate-200/60 md:p-7">
                <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.1em] text-accent-deep">
                  {video.summary.afterTitle}
                </h3>
                <ul className="space-y-4">
                  {video.summary.rows.map((row) => (
                    <li key={row.after} className="flex gap-3">
                      <ArrowRight
                        className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                        strokeWidth={2.5}
                      />
                      <span className="text-[0.9375rem] font-medium leading-relaxed text-text-primary">
                        {row.after}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ---------- Ablauf ---------- */}
        <section className="border-y border-border bg-bg-elevated py-14 md:py-20">
          <div className="section-container">
            <ScrollReveal>
              <div className="mx-auto max-w-[720px] text-center">
                <span className="lp-kicker">{video.steps.kicker}</span>
                <h2 className="headline-h2 mt-5">{video.steps.headline}</h2>
              </div>
            </ScrollReveal>

            <div className="mx-auto mt-9 grid max-w-[980px] gap-5 md:grid-cols-3">
              {video.steps.items.map((step, i) => (
                <ScrollReveal key={step.title} delay={0.08 * i}>
                  <div className="h-full rounded-2xl border border-border bg-white p-6">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                      {i + 1}
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-text-primary">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-text-secondary">
                      {step.text}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Referenz ---------- */}
        <section className="section-container py-14 md:py-20">
          <div className="mx-auto max-w-[720px]">
            <Testimonial />
          </div>
        </section>

        {/* ---------- Terminbuchung ---------- */}
        <BookingCta />
      </main>

      <SiteFooter />
    </div>
  );
};

export default Video;
