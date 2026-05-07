import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { BrowserMockup } from "./BrowserMockup";

export const Hero = () => {
  return (
    <section id="top" className="relative overflow-hidden bg-gradient-soft">
      <div className="container grid gap-14 py-20 md:py-28 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
        <div className="animate-fade-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Für KMU und lokale Unternehmen in der Schweiz
          </div>

          <h1 className="text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
            Eine Website, die Vertrauen schafft
            <span className="block text-primary">und neue Kunden bringt.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Viele KMU verlieren täglich Anfragen, weil ihre Website veraltet wirkt, auf dem Handy schwer
            nutzbar ist oder online kaum gefunden wird. Wir sorgen dafür, dass Ihr Unternehmen online
            so professionell auftritt, wie Sie tatsächlich arbeiten.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-12 px-6 text-base">
              <Link to="/beratung">
                Kostenlose Beratung buchen
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
              <a href="#ablauf">So läuft es ab</a>
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Unverbindlich · Antwort innerhalb von 48 Stunden
          </div>
        </div>

        <div className="relative animate-fade-up [animation-delay:120ms]">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/5 blur-2xl" />
          <BrowserMockup variant="modern" className="shadow-elevated" />
          <div className="absolute -bottom-6 -left-6 hidden w-48 rounded-2xl border border-border bg-card p-4 shadow-card sm:block">
            <div className="text-xs text-muted-foreground">Klar erkennbar</div>
            <div className="mt-1 text-sm font-medium leading-snug">
              Was Sie anbieten. Für wen. Und wie man Sie erreicht.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
