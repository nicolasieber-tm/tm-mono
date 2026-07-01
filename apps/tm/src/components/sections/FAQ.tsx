import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSectionMode, modeToClass } from "@/lib/theme";
import { SectionBackdrop } from "@/components/SectionBackdrop";

const faqs = [
  {
    q: "Wie läuft das Erstgespräch ab?",
    a: "30 Minuten per Video-Call. Wir hören zu, ordnen Ihre Situation ein und sagen offen, ob und wo wir der richtige Partner sind. Kein Sales-Pitch, keine Folgekosten, keine Verpflichtung.",
  },
  {
    q: "Was kostet ein typisches Projekt?",
    a: "Das hängt vom Umfang Ihrer Idee ab. Genau deshalb starten wir mit einem kostenlosen Erstgespräch: Erst wenn klar ist, was Sie brauchen, erhalten Sie ein konkretes, fixes Angebot.",
  },
  {
    q: "Wie lange dauert die Umsetzung?",
    a: "Erste produktive Resultate sind oft in 2 bis 6 Wochen sichtbar. Grössere Lösungen werden in klar definierten Etappen ausgerollt, damit Nutzen früh entsteht und nicht erst am Projektende.",
  },
  {
    q: "Für welche Branchen arbeiten Sie?",
    a: "Schwerpunkt sind Schweizer KMU im Dienstleistungs-, Handwerks- und Servicebereich. Branchenwissen ist hilfreich, aber nicht entscheidend — unser Vorgehen funktioniert überall dort, wo manuelle Abläufe digitalisiert werden sollen.",
  },
  {
    q: "Wo werden meine Daten gespeichert?",
    a: "Standardmässig in der Schweiz oder in der EU. Wenn Sie spezifische Anforderungen haben (z. B. ausschliesslich CH-Hosting, on-premise, FINMA-Vorgaben), berücksichtigen wir das im Architektur-Entscheid.",
  },
  {
    q: "Was, wenn Standard-Software bereits reicht?",
    a: "Dann sagen wir das. Wir bauen nicht zwanghaft eigene Software, sondern empfehlen das, was im Alltag am besten passt — auch wenn das eine bestehende Lösung wie Bexio, HubSpot oder Microsoft 365 ist.",
  },
  {
    q: "Begleiten Sie uns auch nach dem Go-Live?",
    a: "Ja. Wir bleiben Ansprechpartner für Wartung, Weiterentwicklung und Support. Aus einem Projekt soll ein dauerhaft funktionierender Prozess werden — kein einmaliges Liefern und Verschwinden.",
  },
];

export const FAQ = () => {
  const mode = useSectionMode("faq");

  return (
    <section
      id="faq"
      className={`cosmic ${modeToClass(mode)} relative isolate py-20 md:py-32 c-bg`}
    >
      <SectionBackdrop seed={8} />
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <div className="grid gap-12 md:gap-16 md:grid-cols-[1fr_1.4fr] md:items-start">
          {/* Sticky header */}
          <div className="md:sticky md:top-24">
            <div className="flex items-center gap-3 mb-6">
              <span className="hidden sm:block w-8 h-px c-line" />
              <span className="font-mono text-[10px] md:text-[11px] c-text-55 uppercase tracking-[0.3em]">
                FAQ &middot; {String(faqs.length).padStart(2, "0")} Fragen
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] tracking-[-0.02em] c-text">
              Antworten auf{" "}
              <span className="font-display italic font-normal c-text-95">
                häufige
              </span>
              <br />
              Fragen.
            </h2>
            <p className="mt-6 text-base md:text-lg c-text-55 leading-relaxed font-light">
              Was viele KMU-Geschäftsführer:innen vor dem Erstgespräch wissen
              wollen. Fehlt etwas? Schreiben Sie uns — wir antworten persönlich.
            </p>
          </div>

          {/* Accordion */}
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="c-border-faint border-b"
              >
                <AccordionTrigger className="text-left text-base md:text-lg font-light c-text py-5 md:py-6 hover:no-underline">
                  <span className="flex items-baseline gap-4">
                    <span className="font-mono text-[10px] c-text-45 tabular-nums shrink-0 mt-1">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{f.q}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-[15px] c-text-55 leading-relaxed font-light pl-10 pb-6">
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
