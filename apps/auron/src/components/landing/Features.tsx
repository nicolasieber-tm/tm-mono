import { Card, CardContent } from "@/components/ui/card";
import { Timer, MapPin, Receipt, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useReveal } from "@/hooks/use-reveal";

interface FeatureItem {
  icon: ReactNode;
  title: string;
  description: string;
  span: string;
}

const features: FeatureItem[] = [
  {
    icon: <Timer className="w-6 h-6 text-primary" />,
    title: "Zeiterfassung auf Knopfdruck",
    description:
      "Ein Klick öffnet den Arbeitstag, ein Klick beendet ihn. Pausen funktionieren nach dem gleichen Prinzip – ein Klick zum Starten, ein Klick zum Beenden. Am Tagesende steht eine Zusammenfassung mit allen erfassten Zeiten bereit.",
    span: "md:col-span-2",
  },
  {
    icon: <MapPin className="w-6 h-6 text-primary" />,
    title: "Einsatzort-Erkennung",
    description:
      "Auron ordnet Einsätze automatisch dem richtigen Ort zu. Wenn zwei Einsatzorte so nah beieinander liegen, dass eine eindeutige Zuordnung nicht möglich ist – zum Beispiel zwei Baustellen im gleichen Gebäude – erscheint ein kurzer Dialog zur Bestätigung. So landen Zeiten auch in Grenzfällen immer auf dem richtigen Projekt.",
    span: "md:col-span-1",
  },
  {
    icon: <Receipt className="w-6 h-6 text-primary" />,
    title: "Spesen Management",
    description:
      "Quittungen und Belege mit dem Handy abfotografieren – sie landen direkt im Admin-Hub, wo sie zur Freigabe bereitliegen. So kommen alle Spesen zeitnah ins System statt erst am Monatsende.",
    span: "md:col-span-1",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-primary" />,
    title: "Weitere Funktionen folgen…",
    description:
      "Wir arbeiten kontinuierlich an neuen Features, um die Auron App noch leistungsfähiger zu machen.",
    span: "md:col-span-2",
  },
];

const Features = () => {
  const { reveal } = useReveal();
  return (
  <section id="funktionen" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 relative scroll-mt-24">
    {/* Enhanced background glow for glassmorphism pop */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] h-[600px] bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 blur-[100px] rounded-full pointer-events-none -z-10" />

    <div className="max-w-6xl mx-auto relative z-10">
      <div className="text-center mb-12 sm:mb-20">
        <motion.p
          {...reveal(0, 20)}
          className="text-sm font-bold uppercase tracking-widest text-primary mb-4"
        >
          Funktionen im Detail
        </motion.p>
        <motion.h2
          {...reveal(0.1, 30)}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-tight"
        >
          Die Funktionen, die im Alltag den Unterschied machen.
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            {...reveal(i * 0.1, 40)}
            className={f.span}
          >
            <Card className="h-full glass-card overflow-hidden relative border-border/60">
              <CardContent className="p-6 sm:p-8 relative z-10 text-center md:text-left">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4 sm:mb-6 mx-auto md:mx-0">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 sm:mb-4">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed text-balance">{f.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
  );
};

export default Features;
