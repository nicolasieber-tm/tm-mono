import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, CalendarCheck, ClipboardCheck } from "lucide-react";
import { CAL_URL, CONTACT_EMAIL } from "@/lib/links";

export const Contact = () => {
  return (
    <section id="kontakt" className="py-16 md:py-24">
      <div className="container">
        <div
          className="relative overflow-hidden rounded-3xl border border-border bg-primary text-primary-foreground p-10 md:p-16"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: "var(--gradient-accent)" }}
            aria-hidden
          />
          <div className="relative grid gap-12 md:grid-cols-[1.1fr_1fr] md:items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-[1.1]">
                Lassen Sie uns über Ihre
                <br />
                Reibungsverluste sprechen.
              </h2>
              <p className="mt-6 text-base md:text-lg text-primary-foreground/80">
                30 Minuten, ehrlich und unverbindlich. Wir analysieren Ihre
                Situation und sagen offen, ob und wo wir der richtige Partner
                sind.
              </p>

              <ul className="mt-8 space-y-3 text-sm text-primary-foreground/90">
                <li className="flex items-center gap-3">
                  <CalendarCheck className="h-4 w-4 shrink-0" />
                  Termin direkt im Kalender wählen
                </li>
                <li className="flex items-center gap-3">
                  <ClipboardCheck className="h-4 w-4 shrink-0" />
                  Konkrete Einschätzung statt Sales-Pitch
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0" />
                  Persönliche Antwort, kein Auto-Reply
                </li>
              </ul>

              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" variant="secondary" className="group">
                  <a href={CAL_URL} target="_blank" rel="noopener noreferrer">
                    Erstgespräch buchen
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <a href={`mailto:${CONTACT_EMAIL}`}>
                    <Mail className="h-4 w-4" />
                    {CONTACT_EMAIL}
                  </a>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl bg-background overflow-hidden border border-border min-h-[520px]">
              <iframe
                src={`${CAL_URL}?embed=true&theme=light`}
                title="Erstgespräch buchen"
                className="w-full h-[520px] md:h-[600px]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
