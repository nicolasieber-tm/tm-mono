import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { useReveal } from "@/hooks/use-reveal";

const Comparison = () => {
  const { reveal } = useReveal();
  const standardFeatures = [
    "Mitarbeitende tragen Stunden nach Erinnerung nach",
    "Das Büro rennt fehlenden Rapporten hinterher",
    "Regie-Stunden gehen verloren oder werden geschätzt",
    "Projekt-Kalkulation läuft am Ende auf Bauchgefühl",
    "Rechnungen verzögern sich um Tage bis Wochen",
  ];

  const auronFeatures = [
    "Zeiten werden automatisch im Hintergrund erfasst",
    "Einsatzorte werden ohne manuelle Eingabe zugeordnet",
    "Jede Stunde ist sauber einem Projekt zugewiesen",
    "Nachkalkulation basiert auf echten Daten",
    "Rechnungsstellung beginnt am Tag nach Projektende",
  ];

  return (
    <section className="py-16 sm:py-24 bg-background overflow-hidden relative" id="vergleich">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-16 max-w-3xl mx-auto">
          <motion.div {...reveal(0, 20)}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4 sm:mb-6">
              Warum der Wechsel {" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                Sinn macht
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
              Herkömmliche digitale Zeiterfassungssysteme digitalisieren nur Papierkram.
              Auron hingegen minimiert den Erfassungsaufwand.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {/* Standard Column */}
          <motion.div
            {...reveal(0.1, 20)}
            style={{ willChange: "transform, opacity" }}
            className="bg-card w-full border border-border/50 rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg relative overflow-hidden transform-gpu transition-colors duration-500"
          >
            <div className="mb-8 sm:mb-12">
              <h3 className="text-xl sm:text-2xl font-bold">Ohne Auron</h3>
            </div>

            <ul className="space-y-5">
              {standardFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Auron Column */}
          <motion.div
            {...reveal(0.2, 20)}
            style={{ willChange: "transform, opacity" }}
            className="w-full relative overflow-hidden transform-gpu rounded-3xl group shadow-[0_0_40px_rgba(var(--primary),0.15)] hover:shadow-[0_0_60px_rgba(var(--primary),0.3)] transition-shadow duration-500 bg-primary border border-primary-foreground/10 p-6 sm:p-8 md:p-10"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8 sm:mb-12 h-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white">Mit Auron</h3>
                <div className="flex bg-white/10 border border-white/20 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full uppercase tracking-wider">
                  Empfohlen
                </div>
              </div>

              <ul className="space-y-5">
                {auronFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white border border-green-400">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-white font-bold">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
