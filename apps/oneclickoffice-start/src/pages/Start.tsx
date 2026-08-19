import { useCallback, useEffect, useState } from "react";
import { Lock } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OptinModal from "@/components/OptinModal";
import OptinForm from "@/components/OptinForm";
import VideoPoster from "@/components/VideoPoster";
import { optin, testimonial } from "@/lib/content";
import { track } from "@/lib/analytics";

/**
 * Opt-in-Seite (Route "/") — das Ziel der Meta-Ads.
 *
 * Einspaltig, zentriert, kurz: Kicker, Headline, Subheadline, Startbild,
 * ein Button, ein Kundenzitat. Das Formular liegt im Overlay und erscheint
 * erst auf Klick. Alles, was hier zusätzlich stünde, wäre ein Grund, nicht
 * einzutragen — und ein zweiter Weg aus der Seite heraus.
 */
const Start = () => {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    track("optin_view", { page: "start" });
  }, []);

  const openModal = useCallback((ctaId: string) => {
    track("cta_click", { cta_id: ctaId, cta_label: optin.cta.label });
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => setModalOpen(false), []);

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        background: "linear-gradient(180deg, hsl(214 95% 93% / 0.55) 0%, hsl(0 0% 100%) 55%)",
      }}
    >
      <SiteHeader />

      <main className="flex-1">
        <div className="section-container max-w-[1020px] pb-6 pt-8 text-center md:pt-14">
          <span className="lp-kicker">{optin.kicker}</span>

          <h1 className="headline-display mt-6 text-balance">
            {optin.headline.before}{" "}
            {optin.headline.underline && (
              <>
                <span className="underline decoration-accent decoration-[6px] underline-offset-[6px]">
                  {optin.headline.underline}
                </span>{" "}
              </>
            )}
            {optin.headline.after}
          </h1>

          <p className="mx-auto mt-5 max-w-[720px] text-[1.0625rem] leading-relaxed text-text-muted">
            {optin.subheadline}
          </p>

          <div className="mt-9">
            <VideoPoster onOpen={() => openModal("video_poster")} />
          </div>

          {/* Der eine Button. Zweizeilig: Handlung oben, Einwand darunter. */}
          <button
            type="button"
            onClick={() => openModal("hero_button")}
            className="mt-7 inline-flex w-full flex-col items-center justify-center gap-0.5 rounded-xl bg-accent px-7 py-4 font-semibold text-accent-foreground shadow-lg shadow-accent/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-deep hover:shadow-xl sm:w-auto sm:min-w-[420px]"
          >
            <span className="flex items-center gap-2 text-base md:text-lg">
              <Lock className="h-[18px] w-[18px]" />
              {optin.cta.label}
            </span>
            <span className="text-sm font-medium opacity-90">{optin.cta.sub}</span>
          </button>

          <p className="mt-4 text-sm text-text-muted">{optin.note}</p>

          {/* Ein Kundenzitat als Beleg — mehr Social Proof braucht die Seite nicht. */}
          <figure className="mx-auto mt-12 flex max-w-[560px] flex-col items-center gap-3 border-t border-border pt-8 sm:flex-row sm:items-start sm:gap-4 sm:text-left">
            <img
              src={testimonial.image}
              alt=""
              width={96}
              height={96}
              loading="lazy"
              decoding="async"
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
            <div>
              <blockquote className="text-[0.9375rem] leading-relaxed text-text-secondary">
                „{testimonial.quote}"
              </blockquote>
              <figcaption className="mt-2 text-sm text-text-muted">
                <span className="font-semibold text-text-primary">{testimonial.name}</span>
                {" · "}
                {testimonial.role}
              </figcaption>
            </div>
          </figure>
        </div>
      </main>

      <SiteFooter />

      <OptinModal open={modalOpen} onClose={closeModal}>
        <OptinForm />
      </OptinModal>
    </div>
  );
};

export default Start;
