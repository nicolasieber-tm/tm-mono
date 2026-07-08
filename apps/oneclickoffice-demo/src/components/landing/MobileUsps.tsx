import { CheckCircle2 } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

// Kurze USP-Liste direkt nach dem Formular (Vertrauens-/Abschluss-Argumente).
const usps = [
  "Für selbstständige Coaches und Berater in der Schweiz entwickelt.",
  "Schweizer QR-Rechnungen möglich.",
  "Zeiten, Belege, Klienten und Rechnungen an einem Ort.",
  "Keine überladene Buchhaltungssoftware.",
];

const MobileUsps = () => (
  <section className="section-padding py-10">
    <div className="section-container max-w-[560px]">
      <ScrollReveal>
        <ul className="space-y-3">
          {usps.map((u) => (
            <li
              key={u}
              className="flex items-start gap-3 text-[15px] font-medium text-text-primary"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              {u}
            </li>
          ))}
        </ul>
      </ScrollReveal>
    </div>
  </section>
);

export default MobileUsps;
