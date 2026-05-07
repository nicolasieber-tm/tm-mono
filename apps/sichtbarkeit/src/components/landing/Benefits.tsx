import { Sparkles, Smartphone, Search, MessageSquare, MapPin, Zap } from "lucide-react";

const benefits = [
  { icon: Sparkles, title: "Professioneller Eindruck", text: "Ihre Website wirkt so seriös und gepflegt, wie Sie auch im persönlichen Kontakt auftreten." },
  { icon: Smartphone, title: "Funktioniert auf jedem Gerät", text: "Vom Smartphone bis zum Desktop übersichtlich, schnell und einfach zu bedienen." },
  { icon: Search, title: "Bei Google leichter gefunden", text: "Saubere Struktur und solide SEO-Grundlagen, damit Sie bei relevanten Suchen erscheinen." },
  { icon: MessageSquare, title: "Mehr passende Anfragen", text: "Klare Angebote und einfache Kontaktwege führen zu mehr Anfragen und weniger Rückfragen." },
  { icon: MapPin, title: "Lokal sichtbar", text: "Damit Kundinnen und Kunden aus Ihrer Region Sie finden, wenn sie nach Ihrer Leistung suchen." },
  { icon: Zap, title: "Schnell und stabil", text: "Kurze Ladezeiten und ein zuverlässiger Auftritt, ohne dass Sie sich darum kümmern müssen." },
];

export const Benefits = () => {
  return (
    <section className="border-y border-border bg-background py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">Was Sie davon haben</p>
          <h2 className="text-3xl sm:text-4xl">Konkrete Verbesserungen für Ihren Geschäftsalltag</h2>
          <p className="mt-4 text-muted-foreground">
            Kein Marketing-Vokabular, sondern das, was im Tagesgeschäft tatsächlich spürbar ist.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-card"
            >
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg">{b.title}</h3>
              <p className="mt-2 text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
