import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Wie läuft das Erstgespräch ab?",
    a: "30 Minuten per Video-Call. Wir hören zu, ordnen Ihre Situation ein und sagen offen, ob und wo wir der richtige Partner sind. Kein Sales-Pitch, keine Folgekosten, keine Verpflichtung.",
  },
  {
    q: "Was kostet ein typisches Projekt?",
    a: "Das hängt stark vom Umfang ab. Eine Prozessautomatisierung beginnt im niedrigen vierstelligen Bereich, individuelle Software bewegt sich je nach Tiefe im fünfstelligen Bereich. Nach dem Erstgespräch erhalten Sie einen konkreten, fixen Rahmen, keine offenen Stundenpakete.",
  },
  {
    q: "Wie lange dauert die Umsetzung?",
    a: "Erste produktive Resultate sind oft in 2 bis 6 Wochen sichtbar. Grössere Lösungen werden in klar definierten Etappen ausgerollt, damit Nutzen früh entsteht und nicht erst am Projektende.",
  },
  {
    q: "Für welche Branchen arbeiten Sie?",
    a: "Schwerpunkt sind Schweizer KMU im Dienstleistungs-, Handwerks- und Servicebereich. Branchenwissen ist hilfreich, aber nicht entscheidend, unser Vorgehen funktioniert überall dort, wo manuelle Abläufe digitalisiert werden sollen.",
  },
  {
    q: "Wo werden meine Daten gespeichert?",
    a: "Standardmässig in der Schweiz oder in der EU. Wenn Sie spezifische Anforderungen haben (z. B. ausschliesslich CH-Hosting, on-premise, FINMA-Vorgaben), berücksichtigen wir das im Architektur-Entscheid.",
  },
  {
    q: "Was, wenn Standard-Software bereits reicht?",
    a: "Dann sagen wir das. Wir bauen nicht zwanghaft eigene Software, sondern empfehlen das, was im Alltag am besten passt, auch wenn das eine bestehende Lösung wie Bexio, HubSpot oder Microsoft 365 ist.",
  },
  {
    q: "Begleiten Sie uns auch nach dem Go-Live?",
    a: "Ja. Wir bleiben Ansprechpartner für Wartung, Weiterentwicklung und Support. Aus einem Projekt soll ein dauerhaft funktionierender Prozess werden, kein einmaliges Liefern und Verschwinden.",
  },
];

export const FAQ = () => {
  return (
    <section id="faq" className="py-16 md:py-24 bg-secondary/40">
      <div className="container">
        <div className="grid gap-16 md:grid-cols-[1fr_1.4fr] md:items-start">
          <div className="md:sticky md:top-24">
            <p className="text-sm font-medium text-primary">FAQ</p>
            <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
              Antworten auf
              <br />
              häufige Fragen.
            </h2>
            <p className="mt-6 text-base text-muted-foreground leading-relaxed">
              Was viele KMU-Geschäftsführer:innen vor dem Erstgespräch wissen
              wollen. Fehlt etwas? Schreiben Sie uns, wir antworten persönlich.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
