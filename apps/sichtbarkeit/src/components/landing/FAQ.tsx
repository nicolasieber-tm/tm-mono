import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal } from "@/components/ui/reveal";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { useSectionMode, modeToClass } from "@/lib/theme";

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
  const mode = useSectionMode("faq");
  return (
    <section
      id="faq"
      className={`cosmic ${modeToClass(mode)} relative overflow-hidden py-24 md:py-32`}
    >
      <SectionBackdrop seed={8} />
      <div className="relative container-tight max-w-3xl">
        <Reveal>
          <div className="text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.32em] c-text-55">
              · FAQ ·
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light c-text leading-[1.05]">
              Häufige{" "}
              <span className="font-display italic font-normal c-text-95">Fragen</span>
            </h2>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <Accordion type="single" collapsible className="mt-14 w-full">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-b c-border-soft"
              >
                <AccordionTrigger className="py-5 text-left text-base c-text font-medium hover:no-underline hover:c-text-95">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 c-text-70 leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
};
