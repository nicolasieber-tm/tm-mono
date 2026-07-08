import ScrollReveal from "./ScrollReveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Muss ich mich direkt anmelden?",
    a: "Nein. Du erhältst zuerst den Demo-Zugang und kannst OneClick Office unverbindlich anschauen.",
  },
  {
    q: "Funktioniert die Demo auf dem Handy?",
    a: "Die Seite ist mobil optimiert. Die vollständige Demo empfehlen wir am Desktop, weil der Abrechnungsprozess dort am besten sichtbar ist.",
  },
  {
    q: "Ersetzt OneClick Office meine Buchhaltung?",
    a: "OneClick Office fokussiert sich auf Zeiten, Belege, Klienten und Rechnungen. Je nach System kann die Buchhaltung angebunden oder vorbereitet werden.",
  },
  {
    q: "Für wen ist OneClick Office gedacht?",
    a: "Für selbstständige Coaches, Berater und kleine Dienstleister, die ihren Monatsabschluss einfacher und schneller erledigen wollen.",
  },
];

const MobileFaq = () => (
  <section className="section-padding py-12">
    <div className="section-container max-w-[560px]">
      <ScrollReveal>
        <h2 className="headline-h2 mb-8 text-center text-text-primary">Häufige Fragen</h2>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={f.q}
              value={`item-${i}`}
              className="rounded-2xl border border-border border-b bg-white px-5 shadow-sm"
            >
              <AccordionTrigger className="text-left text-[15px] font-semibold text-text-primary hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-[15px] leading-relaxed text-text-secondary">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollReveal>
    </div>
  </section>
);

export default MobileFaq;
