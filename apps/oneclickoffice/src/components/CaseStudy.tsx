import { X, Check } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { caseStudy as data } from "@/lib/content";
import lucaImage from "../../luca.jpg";

interface CaseStudyProps {
  name?: string;
  role?: string;
  subtitle?: string;
  image?: string;
  beforeBullets?: string[];
  afterBullets?: string[];
  metrics?: { value: string; label: string }[];
  quote?: string;
}

const CaseStudy = ({
  name = data.name,
  role = data.role,
  subtitle = data.subtitle,
  image,
  beforeBullets = data.beforeBullets,
  afterBullets = data.afterBullets,
  metrics = data.metrics,
  quote = data.quote,
}: CaseStudyProps) => (
  <section className="section-padding py-8 md:py-12">
    <div className="section-container">
      <ScrollReveal>
        <div className="text-center">
          <p className="kicker mb-4">{data.kicker}</p>
          <h2 className="headline-h2 mb-12">
            Wie Luca seinen monatlichen Admin-Aufwand mit{" "}
            <span className="text-accent">OneClick Office</span> praktisch eliminiert hat.
          </h2>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="bg-bg-elevated border border-border rounded-2xl p-8 md:p-14 max-w-[960px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Links — Bild */}
            <div className="lg:w-[280px] flex-shrink-0">
              <div className="w-full aspect-square max-w-[280px] mx-auto rounded-xl bg-bg-surface overflow-hidden flex items-center justify-center">
                {image ?? lucaImage ? (
                  <img
                    src={image ?? lucaImage}
                    alt={`Portrait von ${name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-text-muted text-sm">
                    {/* Luca-Bild hier einfügen */}
                    Foto
                  </span>
                )}
              </div>
              <div className="text-center mt-4">
                <p className="font-display font-bold text-lg">{name}</p>
                <p className="text-text-secondary text-sm">{role}</p>
                <p className="text-text-muted text-xs mt-1">{subtitle}</p>
              </div>
            </div>

            {/* Rechts — Content */}
            <div className="flex-1 min-w-0">
              {/* Vorher */}
              <p className="kicker text-primary mb-2">VORHER</p>
              <p className="text-text-secondary text-sm mb-3">
                So sah {name}s Monatsende vor OneClick Office aus:
              </p>
              <ul className="space-y-2 mb-8">
                {beforeBullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-text-muted text-sm">{b}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-border my-8" />

              {/* Nachher */}
              <p className="kicker text-emerald-400 mb-2">
                HEUTE MIT ONECLICK OFFICE
              </p>
              <p className="text-text-secondary text-sm mb-3">
                So sieht {name}s Admin heute aus:
              </p>
              <ul className="space-y-2 mb-8">
                {afterBullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-text-secondary text-sm">{b}</span>
                  </li>
                ))}
              </ul>

              {/* Metriken */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {metrics.map((m, i) => (
                  <div
                    key={i}
                    className="bg-bg-surface rounded-lg p-4 text-center"
                  >
                    <p className="font-display font-bold text-2xl text-highlight">
                      {m.value}
                    </p>
                    <p className="text-text-muted text-xs mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Zitat */}
          <p className="body-large italic text-foreground text-center mt-10 max-w-[640px] mx-auto">
            {quote}
          </p>
        </div>
      </ScrollReveal>
    </div>
  </section>
);

export default CaseStudy;
