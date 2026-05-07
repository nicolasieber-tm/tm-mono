import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/use-reveal";

const BookConsultation = () => {
  const { reveal } = useReveal();
  return (
  <section className="pt-10 sm:pt-12 md:pt-16 pb-16 sm:pb-24 md:pb-32 px-4 sm:px-6 bg-muted/30 relative overflow-hidden">
    <div className="max-w-5xl mx-auto relative z-10">
      <div className="bg-background rounded-3xl p-6 sm:p-10 md:p-16 shadow-lg border border-border text-center relative overflow-hidden">
        {/* Dekorative Hintergrundelemente in der Karte */}
        <div className="absolute top-0 right-0 -mx-20 -my-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mx-20 -my-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.p
            {...reveal(0, 20)}
            className="text-sm font-bold uppercase tracking-widest text-primary mb-4"
          >
            BERATUNG BUCHEN
          </motion.p>
          <motion.h2
            {...reveal(0, 30)}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 tracking-tight text-foreground"
          >
            Bereit, Ihre Zeiterfassung zu automatisieren?
          </motion.h2>
          <motion.p
            {...reveal(0.1, 30)}
            className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto"
          >
            Vereinbaren Sie ein unverbindliches und kostenloses Beratungsgespräch, um herauszufinden, wie Auron Ihre Zeiterfassung einfacher und effizienter machen kann.
          </motion.p>

          <motion.div {...reveal(0.2, 20)}>
            <Button asChild size="lg" className="rounded-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg group w-full sm:w-auto max-w-full">
              <a href="/anfrage" className="inline-flex items-center justify-center whitespace-normal">
                <Calendar className="mr-2 h-5 w-5 flex-shrink-0" />
                <span>Kostenlose Beratung buchen</span>
                <ArrowRight className="ml-2 h-5 w-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  </section>
  );
};

export default BookConsultation;
