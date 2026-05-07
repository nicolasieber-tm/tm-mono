import { MapPin, PlayCircle, StopCircle, FileCheck } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useReveal } from "@/hooks/use-reveal";

interface Step {
  icon: ReactNode;
  number: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: <PlayCircle className="w-8 h-8 text-primary" />,
    number: "01",
    title: "Zeiterfassung startet",
    description: "Zeiterfassung startet und läuft im Hintergrund.",
  },
  {
    icon: <MapPin className="w-8 h-8 text-primary" />,
    number: "02",
    title: "Automatische Erkennung",
    description: "Auron erkennt den Einsatzort automatisch im Hintergrund.",
  },
  {
    icon: <StopCircle className="w-8 h-8 text-primary" />,
    number: "03",
    title: "Zeiterfassung beendet",
    description: "Zeiterfassung stoppen, Zusammenfassung anschauen.",
  },
  {
    icon: <FileCheck className="w-8 h-8 text-primary" />,
    number: "04",
    title: "Rapport erstellt",
    description:
      "Rapporte liegen strukturiert und fehlerfrei für die weitere Verarbeitung bereit – die direkte ERP-Anbindung folgt.",
  },
];

const HowItWorks = () => {
  const { reveal } = useReveal();
  return (
  <section id="prozess" className="py-24 md:py-32 px-6 bg-muted/30 border-y border-border/50 relative overflow-hidden scroll-mt-24">
    {/* Background glow for the whole section to give it depth */}
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none -z-10" />
    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none -z-10" />

    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-20">
        <motion.p
          {...reveal(0, 20)}
          className="text-sm font-bold uppercase tracking-widest text-primary mb-4"
        >
          Vier Schritte zur automatisierten Zeiterfassung.
        </motion.p>
        <motion.h2
          {...reveal(0.1, 30)}
          className="text-4xl md:text-5xl font-extrabold text-center tracking-tight text-foreground"
        >
          So einfach funktioniert AURON
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-14 relative">
        {/* Connecting line for desktop */}
        <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            {...reveal(i * 0.2, 40)}
            className="relative flex flex-col items-center text-center"
          >
            <div className="relative">
              <div className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-background border border-border/80 shadow-md mb-8">
                {step.icon}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shadow-lg ring-4 ring-background">
                  {step.number}
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-4">{step.title}</h3>
            <p className="text-muted-foreground leading-relaxed max-w-[320px] text-base">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
  );
};

export default HowItWorks;
