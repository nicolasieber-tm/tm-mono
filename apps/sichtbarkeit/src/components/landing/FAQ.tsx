import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "Für wen ist das Angebot gedacht?",
    a: "Für KMU und lokale Unternehmen in der Schweiz. Typischerweise inhabergeführte Betriebe, lokale Dienstleister, Handwerk, Praxen und Kanzleien, die online professioneller wirken und besser gefunden werden möchten.",
  },
  {
    q: "Wir haben noch gar keine Website. Ist das ein Problem?",
    a: "Nein, im Gegenteil. Dann starten wir ohne Altlasten und können den Auftritt von Anfang an so aufbauen, dass er zu Ihrem Unternehmen passt und im Alltag funktioniert.",
  },
  {
    q: "Unsere Website ist nur etwas in die Jahre gekommen. Lohnt sich eine Anpassung?",
    a: "Häufig ja. Manchmal genügt eine klarere Struktur und ein zeitgemässes Erscheinungsbild, damit Besucher länger bleiben und Anfragen stellen. In der kostenlosen Analyse sagen wir Ihnen ehrlich, was sinnvoll ist.",
  },
  {
    q: "Wie läuft die kostenlose Einschätzung ab?",
    a: "Sie senden uns das Kontaktformular. Wir schauen uns Ihren Auftritt in Ruhe an und melden uns innerhalb von 48 Stunden per E-Mail mit einer schriftlichen Einschätzung und konkreten Empfehlungen.",
  },
  {
    q: "Ist die Einschätzung wirklich unverbindlich?",
    a: "Ja. Es gibt kein Verkaufsgespräch und keine versteckten Kosten. Wenn Sie danach mit uns weiterarbeiten möchten, freut uns das. Wenn nicht, ist das genauso in Ordnung.",
  },
  {
    q: "Was kostet eine neue Website ungefähr?",
    a: "Das hängt vom Umfang ab. Nach der Analyse erhalten Sie einen transparenten Vorschlag mit klaren Preisen, ohne Pakete, die Sie eigentlich nicht brauchen.",
  },
];

export const FAQ = () => {
  return (
    <section id="faq" className="bg-gradient-soft py-20 md:py-28">
      <div className="container max-w-3xl">
        <div className="text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">FAQ</p>
          <h2 className="text-3xl sm:text-4xl">Häufige Fragen</h2>
        </div>

        <Accordion type="single" collapsible className="mt-12 w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b border-border">
              <AccordionTrigger className="py-5 text-left text-base font-medium hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
