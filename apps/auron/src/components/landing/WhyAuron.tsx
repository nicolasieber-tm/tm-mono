import { motion } from "framer-motion";
import {
  MousePointerClick,
  MessageSquareOff,
  Receipt,
  Calculator,
  ClipboardCheck,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useReveal } from "@/hooks/use-reveal";

const items = [
  {
    icon: <MousePointerClick className="w-6 h-6 text-primary" />,
    title: "Keine manuelle Rapportierung mehr",
    description:
      "Zwei Klicks pro Tag ersetzen den Stundenzettel. Einsatzorte werden automatisch erkannt, Zeiten laufen im Hintergrund mit.",
  },
  {
    icon: <MessageSquareOff className="w-6 h-6 text-primary" />,
    title: "Weniger Rückfragen aus dem Büro",
    description:
      "Saubere Zeitdaten liegen am Abend vor. Keine Nachträge, keine WhatsApp-Rückfragen, keine Monatsend-Korrekturen.",
  },
  {
    icon: <Receipt className="w-6 h-6 text-primary" />,
    title: "Abrechnung ohne Rekonstruktion",
    description:
      "Stunden werden im Moment des Einsatzes erfasst – nicht am Monatsende aus der Erinnerung zusammengeschrieben. Die Abrechnung startet mit verlässlichen Daten.",
  },
  {
    icon: <Calculator className="w-6 h-6 text-primary" />,
    title: "Projekte werden nachkalkulierbar",
    description:
      "Jede Stunde ist automatisch einem Einsatzort zugeordnet. Nach Projektabschluss sehen Sie, wo die Zeit tatsächlich hingeflossen ist – und können die nächste Kalkulation darauf aufbauen.",
  },
  {
    icon: <ClipboardCheck className="w-6 h-6 text-primary" />,
    title: "Keine vergessenen Regie-Stunden",
    description:
      "Was im Einsatz passiert, wird erfasst. Auch Zusatzarbeiten, die in handschriftlichen Rapporten oft untergehen.",
  },
  {
    icon: <Activity className="w-6 h-6 text-primary" />,
    title: "Live-Übersicht für die Betriebsleitung",
    description:
      "Der Admin-Hub zeigt in Echtzeit, welches Team wo ist – ohne dass das Büro anrufen muss.",
  },
];

const WhyAuron = () => {
  const { reveal } = useReveal();
  return (
  <section id="vorteile" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 scroll-mt-24">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-10 sm:mb-16">
        <motion.p
          {...reveal(0, 20)}
          className="text-sm font-bold uppercase tracking-widest text-primary mb-4"
        >
          Warum AURON?
        </motion.p>
        <motion.h2
          {...reveal(0.1, 30)}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground"
        >
          Konkrete Ergebnisse, die spürbar entlasten.
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {items.map((item, i) => (
          <motion.div
            key={item.title}
            {...reveal(i * 0.1, 40)}
          >
            <Card className="h-full glass-card hover:bg-background/90 transition-all duration-300">
              <CardContent className="p-6 sm:p-8 text-center md:text-left">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 sm:mb-6 mx-auto md:mx-0">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 sm:mb-4">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
  );
};

export default WhyAuron;
