import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { CAL_URL } from "@/lib/links";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="container pt-24 md:pt-36 pb-16 md:pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-primary" />
            Digitalisierungspartner für Schweizer KMU
          </div>
          <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] text-foreground">
            Weniger Admin.
            <br />
            <span className="bg-gradient-to-r from-primary to-[hsl(230_75%_60%)] bg-clip-text text-transparent">
              Mehr Zeit fürs Kerngeschäft.
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Wir analysieren Ihren Betrieb dort, wo im Alltag Reibung entsteht,
            und bauen daraus Software, KI und Prozesse, die im Tagesgeschäft
            tatsächlich wirken.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="group">
              <a href={CAL_URL} target="_blank" rel="noopener noreferrer">
                Erstgespräch buchen
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/selbstcheck">Digitalisierungs-Check starten</a>
            </Button>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            30 Minuten · unverbindlich · ehrliche Einschätzung statt Sales-Pitch
          </p>
        </div>
      </div>
    </section>
  );
};
