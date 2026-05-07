import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { useReveal } from "@/hooks/use-reveal";

const items = [
  {
    q: "Ist Auron datenschutzkonform?",
    a: "Ja, alle Daten bleiben auf Schweizer Servern und werden DSGVO-konform verarbeitet. Auron erfüllt höchste schweizer Sicherheitsstandards.",
  },
  {
    q: "Können Rapporte exportiert werden?",
    a: "Ja, Rapporte können auch als PDF oder Excel exportiert werden. Auron ist flexibel und passt sich an Ihre bestehenden Arbeitsabläufe an.",
  },
  {
    q: "Wie lange dauert die Einrichtung?",
    a: "In wenigen Tagen, inklusive Einrichtung und Schulung Ihres Teams. Unser Onboarding-Prozess ist darauf optimiert, dass Sie schnell produktiv arbeiten können.",
  },
  {
    q: "Was kostet Auron?",
    a: "Auron bietet flexible Preismodelle ab CHF 12/Monat pro Nutzer. Kontaktieren Sie uns für ein individuelles Angebot basierend auf Ihren Anforderungen.",
  },
  {
    q: "Funktioniert Auron auch offline?",
    a: "Ja, Auron funktioniert auch ohne Internetverbindung. Daten werden lokal gespeichert und automatisch synchronisiert, sobald wieder eine Verbindung besteht.",
  },
  {
    q: "Auf welchen Geräten läuft Auron?",
    a: "Auron läuft auf allen gängigen Smartphones und Tablets (iOS und Android) sowie auf Desktop-Computern über den Webbrowser.",
  },
];

const FAQ = () => {
  const { reveal } = useReveal();
  return (
  <section id="faq" className="py-24 md:py-32 px-6">
    <div className="max-w-3xl mx-auto">
      <motion.h2
        {...reveal(0, 30)}
        className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 tracking-tight text-foreground"
      >
        Häufig gestellte Fragen
      </motion.h2>
      <motion.div {...reveal(0.1, 30)}>
        <Accordion type="single" collapsible className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-foreground font-medium text-base md:text-lg">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </div>
  </section>
  );
};

export default FAQ;
