import { Sparkles, Smartphone, Search, MessageSquare, MapPin, Zap } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { useSectionMode, modeToClass } from "@/lib/theme";

const benefits = [
  { icon: Sparkles, title: "Professioneller Eindruck", text: "Ihre Website wirkt so seriös und gepflegt, wie Sie auch im persönlichen Kontakt auftreten.", from: "#a78bfa", to: "#7c3aed" },
  { icon: Smartphone, title: "Funktioniert auf jedem Gerät", text: "Vom Smartphone bis zum Desktop übersichtlich, schnell und einfach zu bedienen.", from: "#c084fc", to: "#9333ea" },
  { icon: Search, title: "Bei Google leichter gefunden", text: "Saubere Struktur und solide SEO-Grundlagen, damit Sie bei relevanten Suchen erscheinen.", from: "#8b5cf6", to: "#6d28d9" },
  { icon: MessageSquare, title: "Mehr passende Anfragen", text: "Klare Angebote und einfache Kontaktwege führen zu mehr Anfragen und weniger Rückfragen.", from: "#a78bfa", to: "#7c3aed" },
  { icon: MapPin, title: "Lokal sichtbar", text: "Damit Kundinnen und Kunden aus Ihrer Region Sie finden, wenn sie nach Ihrer Leistung suchen.", from: "#c084fc", to: "#9333ea" },
  { icon: Zap, title: "Schnell und stabil", text: "Kurze Ladezeiten und ein zuverlässiger Auftritt, ohne dass Sie sich darum kümmern müssen.", from: "#8b5cf6", to: "#6d28d9" },
];

export const Benefits = () => {
  const mode = useSectionMode("benefits");
  return (
    <section
      id="nutzen"
      className={`cosmic ${modeToClass(mode)} relative overflow-hidden py-24 md:py-32`}
    >
      <SectionBackdrop seed={3} />
      <div className="relative container-tight">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.32em] c-text-55">
              · Was Sie davon haben ·
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light c-text leading-[1.05]">
              Konkrete Verbesserungen
              <span className="block font-display italic font-normal c-text-95 mt-2">
                für Ihren Geschäftsalltag
              </span>
            </h2>
            <p className="mt-6 c-text-55 max-w-xl mx-auto">
              Kein Marketing-Vokabular, sondern das, was im Tagesgeschäft tatsächlich spürbar ist.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delay={i * 70}>
              <div
                className="c-card-lift c-surface rounded-2xl p-6 h-full group"
                style={{
                  ["--card-accent-from" as string]: b.from,
                  ["--card-accent-to" as string]: b.to,
                  ["--card-accent-glow" as string]: `${b.from}66`,
                }}
              >
                <div className="relative mb-5 h-12 w-12">
                  <span className="c-icon-halo" aria-hidden />
                  <div
                    className="c-icon-float relative grid h-12 w-12 place-items-center rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${b.from}33, ${b.to}22)`,
                      boxShadow: `0 0 24px -4px ${b.from}44 inset`,
                    }}
                  >
                    <b.icon className="h-5 w-5" style={{ color: b.from }} />
                  </div>
                </div>
                <h3 className="text-lg c-text font-medium">{b.title}</h3>
                <p className="mt-2 c-text-55 text-sm leading-relaxed">{b.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
