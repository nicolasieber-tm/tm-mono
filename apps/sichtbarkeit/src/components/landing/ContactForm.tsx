import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Clock, ShieldCheck, CalendarCheck, ArrowRight } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLScD7ZpEgO2n1XvpUsiUYKL4usLU84LBid3Y7kzYuDH9bKdQFw/formResponse";

const FIELD_IDS = {
  name: "entry.1505561126",
  firma: "entry.275091510",
  email: "entry.974722826",
  website: "entry.5008050",
  nachricht: "entry.1366752365",
} as const;

export const ContactForm = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = new FormData();
    payload.append(FIELD_IDS.name, String(data.get("name") ?? ""));
    payload.append(FIELD_IDS.firma, String(data.get("firma") ?? ""));
    payload.append(FIELD_IDS.email, String(data.get("email") ?? ""));
    payload.append(FIELD_IDS.website, String(data.get("website") ?? ""));
    payload.append(FIELD_IDS.nachricht, String(data.get("nachricht") ?? ""));

    try {
      // no-cors: Google Forms akzeptiert die Daten, Antwort ist opaque (das ist erwartet)
      await fetch(GOOGLE_FORM_ACTION, {
        method: "POST",
        mode: "no-cors",
        body: payload,
      });
      toast.success("Vielen Dank. Wir melden uns innerhalb eines Werktags.");
      form.reset();
    } catch (err) {
      toast.error("Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt per E-Mail.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="kontakt" className="border-t border-border bg-background py-20 md:py-28">
      <div className="container">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <CalendarCheck className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium">Lieber direkt einen Termin buchen?</p>
              <p className="text-sm text-muted-foreground">
                Drei kurze Fragen, dann sofort einen Slot auswählen.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0">
            <Link to="/beratung">
              Beratung buchen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="container grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">Oder per Formular</p>
          <h2 className="text-3xl sm:text-4xl">Schreiben Sie uns kurz. Wir melden uns innerhalb eines Werktags.</h2>
          <p className="mt-5 text-muted-foreground">
            Ein paar Sätze zu Ihrem Unternehmen genügen. Sie erhalten anschliessend eine ehrliche
            Einschätzung Ihres Online-Auftritts und konkrete Empfehlungen. Kostenlos und ohne Verpflichtung.
          </p>

          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex items-center gap-3 text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" /> Antwort innerhalb von 48 Stunden
            </li>
            <li className="flex items-center gap-3 text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" /> Unverbindlich · Ohne Verkaufsgespräch
            </li>
            <li className="flex items-center gap-3 text-muted-foreground">
              <Mail className="h-4 w-4 text-primary" /> Persönliche Antwort per E-Mail
            </li>
          </ul>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required placeholder="Vor- und Nachname" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firma">Firma *</Label>
              <Input id="firma" name="firma" required placeholder="Unternehmen" />
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <Label htmlFor="email">E-Mail *</Label>
            <Input id="email" name="email" type="email" required placeholder="name@unternehmen.ch" />
          </div>
          <div className="mt-5 space-y-2">
            <Label htmlFor="website">Website (optional)</Label>
            <Input id="website" name="website" placeholder="https://" />
          </div>
          <div className="mt-5 space-y-2">
            <Label htmlFor="nachricht">Kurze Nachricht</Label>
            <Textarea
              id="nachricht"
              name="nachricht"
              rows={4}
              placeholder="Was möchten Sie an Ihrem Online-Auftritt verbessern?"
            />
          </div>

          <Button type="submit" size="lg" className="mt-6 h-12 w-full text-base" disabled={loading}>
            {loading ? "Wird gesendet…" : "Kostenlose Analyse anfordern"}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Mit dem Absenden stimmen Sie zu, dass wir Ihre Angaben zur Bearbeitung Ihrer Anfrage verwenden.
          </p>
        </form>
      </div>
    </section>
  );
};
