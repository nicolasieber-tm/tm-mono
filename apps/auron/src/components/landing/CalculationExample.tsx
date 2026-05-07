import { motion } from "framer-motion";
import { Calculator } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";

const CalculationExample = () => {
  const { reveal } = useReveal();

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto">
        <motion.div
          {...reveal(0, 30)}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-5">
            <Calculator className="w-3.5 h-3.5" />
            Ein Rechenbeispiel
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Was ein Betrieb pro Woche verliert
          </h2>
        </motion.div>

        <motion.div
          {...reveal(0.1, 30)}
          style={{ willChange: "transform, opacity" }}
          className="relative rounded-3xl glass-card p-6 sm:p-10 md:p-14 shadow-lg overflow-hidden"
        >
          {/* Decorative corner gradient */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-center sm:text-left">
              Nehmen wir einen Handwerksbetrieb mit{" "}
              <span className="font-semibold text-foreground">15 Mitarbeitenden</span>.
              Wenn jeder täglich rund{" "}
              <span className="font-semibold text-foreground">10 Minuten</span> mit
              Rapportierung, Nachtragen und Rückfragen verliert, sind das:
            </p>

            {/* Big eye-catcher stat */}
            <div className="my-8 sm:my-12 text-center">
              <div className="inline-block">
                <div className="text-[48px] sm:text-[68px] md:text-[88px] font-black leading-none tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-primary via-primary to-blue-600">
                  12,5h
                </div>
                <div className="mt-2 text-base sm:text-lg font-bold text-foreground uppercase tracking-widest">
                  pro Woche
                </div>
              </div>
            </div>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-center sm:text-left">
              Mit Auron entfällt dieser Aufwand weitgehend. Die Zeit, die heute in
              Nachbearbeitung fliesst, steht dem{" "}
              <span className="font-semibold text-foreground">Büro und dem Betrieb</span>{" "}
              wieder zur Verfügung.
            </p>

            <div className="mt-8 pt-6 border-t border-border/60">
              <p className="text-xs sm:text-sm italic text-muted-foreground/80 leading-relaxed text-center sm:text-left">
                Dies ist eine Modellrechnung. Konkrete Kennzahlen aus unseren
                Pilotbetrieben folgen in den kommenden Wochen.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CalculationExample;
