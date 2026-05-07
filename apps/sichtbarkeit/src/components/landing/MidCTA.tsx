import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const MidCTA = () => {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-cta p-10 text-primary-foreground sm:p-14">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/5 blur-2xl" />

          <div className="relative max-w-2xl">
            <h2 className="text-3xl text-primary-foreground sm:text-4xl">
              Eine ehrliche Einschätzung Ihres Online-Auftritts. Kostenlos.
            </h2>
            <p className="mt-4 text-base text-primary-foreground/85 sm:text-lg">
              Wir prüfen Ihre Website auf die Punkte, die für Vertrauen, Auffindbarkeit und Anfragen
              entscheidend sind, und melden uns mit konkreten Empfehlungen.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" variant="secondary" className="h-12 px-6 text-base">
                <Link to="/beratung">
                  Kostenlose Beratung buchen
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <span className="text-sm text-primary-foreground/80">
                Unverbindlich · Ohne Verkaufsgespräch · Innerhalb von 48 Stunden
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
