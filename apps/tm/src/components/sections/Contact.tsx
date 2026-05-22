import {
  ArrowRight,
  Mail,
  CalendarCheck,
  ClipboardCheck,
  MessageSquare,
} from "lucide-react";
import { CAL_URL, CONTACT_EMAIL } from "@/lib/links";
import { useSectionMode, modeToClass } from "@/lib/theme";
import { SectionBackdrop } from "@/components/SectionBackdrop";

const guarantees = [
  { Icon: CalendarCheck, text: "Termin direkt im Kalender wählen" },
  { Icon: ClipboardCheck, text: "Konkrete Einschätzung statt Sales-Pitch" },
  { Icon: MessageSquare, text: "Persönliche Antwort, kein Auto-Reply" },
];

export const Contact = () => {
  const mode = useSectionMode("contact");

  return (
    <section
      id="kontakt"
      className={`cosmic ${modeToClass(mode)} relative isolate py-20 md:py-32 c-bg`}
    >
      <SectionBackdrop seed={6} />
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <div className="grid gap-12 md:gap-16 md:grid-cols-[1.1fr_1fr] md:items-start">
          {/* Left: CTA content */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="hidden sm:block w-8 h-px c-line" />
              <span className="font-mono text-[10px] md:text-[11px] c-text-55 uppercase tracking-[0.3em]">
                Kontakt &middot; 30 Min unverbindlich
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] tracking-[-0.02em] c-text">
              Lassen Sie uns über Ihre{" "}
              <span className="font-display italic font-normal c-text-95">
                Reibungs&shy;verluste
              </span>{" "}
              sprechen.
            </h2>
            <p className="mt-6 text-base md:text-lg c-text-55 leading-relaxed max-w-lg font-light">
              30 Minuten, ehrlich und unverbindlich. Wir analysieren Ihre
              Situation und sagen offen, ob und wo wir der richtige Partner
              sind.
            </p>

            <ul className="mt-10 space-y-4">
              {guarantees.map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-4">
                  <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full">
                    <span className="absolute inset-0 rounded-full accent-gradient-anim opacity-80" />
                    <span className="relative inline-flex h-[calc(100%-3px)] w-[calc(100%-3px)] items-center justify-center rounded-full c-surface">
                      <Icon className="h-3.5 w-3.5 c-text" strokeWidth={1.5} />
                    </span>
                  </span>
                  <span className="text-sm md:text-base c-text-70">{text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a
                href={CAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group/p relative rounded-full text-sm px-7 py-3.5 inline-flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  backgroundColor: "rgb(var(--c-fg))",
                  color: "hsl(var(--c-bg))",
                }}
              >
                <span className="absolute inset-[-2px] rounded-full opacity-0 group-hover/p:opacity-100 transition-opacity accent-gradient-anim -z-10" />
                Erstgespräch buchen
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover/p:translate-x-0.5"
                  strokeWidth={1.8}
                />
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="group/s relative rounded-full text-sm px-7 py-3.5 border c-border-strong c-text inline-flex items-center justify-center gap-2 transition-colors hover:c-border-stronger"
                style={{ backgroundColor: "rgb(var(--c-fg) / 0.02)" }}
              >
                <Mail className="h-4 w-4" strokeWidth={1.5} />
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>

          {/* Right: Cal.com iframe in cosmic frame */}
          <div className="relative">
            <span className="absolute inset-0 rounded-3xl accent-gradient-anim opacity-60 pointer-events-none" />
            <div className="relative rounded-3xl c-surface m-[1.5px] overflow-hidden border c-border">
              {/* mock browser top bar */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b c-border-faint">
                <span className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: "rgb(var(--c-fg) / 0.2)" }} />
                <span className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: "rgb(var(--c-fg) / 0.2)" }} />
                <span className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: "rgb(var(--c-fg) / 0.2)" }} />
                <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.2em] c-text-45 truncate">
                  cal.com / Erstgespräch
                </span>
              </div>
              <iframe
                src={`${CAL_URL}?embed=true&theme=light`}
                title="Erstgespräch buchen"
                className="w-full h-[480px] sm:h-[560px] md:h-[640px] bg-white"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
