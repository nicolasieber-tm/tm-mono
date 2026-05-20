import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Reveal } from "@/components/ui/reveal";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { useSectionMode, modeToClass } from "@/lib/theme";

export const MidCTA = () => {
  const mode = useSectionMode("midcta");
  return (
    <section className={`cosmic ${modeToClass(mode)} relative overflow-hidden py-20 md:py-28`}>
      <SectionBackdrop seed={7} />
      <div className="relative container-tight">
        <Reveal>
          <div
            className="liquid-glass relative overflow-hidden rounded-3xl p-10 sm:p-14"
            style={{
              backgroundColor: "hsl(var(--c-surface) / 0.6)",
            }}
          >
            <div
              className="absolute -right-32 -top-32 h-80 w-80 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(167,139,250,0.35) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />
            <div
              className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(124,58,237,0.30) 0%, transparent 70%)",
                filter: "blur(50px)",
              }}
            />

            <div className="relative max-w-2xl">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.32em] c-text-55">
                · Kostenlos · Unverbindlich ·
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-light c-text leading-[1.05]">
                Eine ehrliche Einschätzung
                <span className="block font-display italic font-normal c-text-95 mt-2">
                  Ihres Online-Auftritts.
                </span>
              </h2>
              <p className="mt-5 c-text-70 leading-relaxed max-w-xl">
                Wir prüfen Ihre Website auf die Punkte, die für Vertrauen, Auffindbarkeit und Anfragen
                entscheidend sind, und melden uns mit konkreten Empfehlungen.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/beratung"
                  className="group relative inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium transition-all duration-300 hover:scale-[1.02]"
                  style={{ backgroundColor: "rgb(var(--c-fg))", color: "hsl(var(--c-bg))" }}
                >
                  <span className="absolute inset-[-2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity accent-gradient-anim -z-10" />
                  Kostenlose Beratung buchen
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="font-mono text-[11px] c-text-45 uppercase tracking-[0.22em]">
                  innerhalb 48 stunden · ohne verkaufsgespräch
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
