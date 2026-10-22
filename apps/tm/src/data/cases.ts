/* =================================================================
   Fallstudien für /kundenstimmen/<slug>.

   Zitat, Name, Foto und Logo kommen aus @tm/testimonials (über `slug`
   verknüpft) — hier steht nur, was die Detailseite zusätzlich erzählt.
   Alle Angaben sind mit den Kunden abgestimmt bzw. freigegeben; keine
   Zahlen erfinden. Fehlt etwas, lieber den Abschnitt weglassen.

   `draft: true` → Seite und Karte erscheinen noch nicht (z.B. Zitat fehlt).
   ================================================================= */
import { TESTIMONIALS, type Testimonial } from "@tm/testimonials";

/** Was unter dem Story-Teil als Anschauung gezeigt wird */
export type CaseVisual =
  | { kind: "beforeafter" }           // Vorher/Nachher-Slider (Verkehrsschule)
  | { kind: "booking" }               // Termin-Pingpong → Buchungstool (web)
  | { kind: "emailauto" }             // E-Mail → Projektzeit (Kohler)
  | { kind: "b2b" }                   // B2B-Buchungslink (Moodpix)
  | { kind: "oco" }                   // Screenshots OneClick Office
  | { kind: "placeholder"; text: string };

export type CaseStudy = {
  slug: string;
  /** Kategorie für Filter + Tag */
  category: "web" | "auto" | "oco";
  /** kurzer Tag-Text auf Karte und Seite */
  label: string;
  industry: string;
  service: string;
  /** z.B. „seit Anfang 2026" oder „rund ein Jahr im Einsatz" */
  status?: string;
  /** Headline der Fallstudie */
  title: string;
  /** Einleitung unter der Headline */
  sub: string;
  /** Kennzahl für Karte + Hero (nur echte Zahlen) */
  metric?: { value: string; label: string };
  challenge: { title: string; text: string[] };
  solution: { title: string; text: string[]; points?: string[] };
  result: { title: string; text: string[]; stats?: { value: string; label: string }[] };
  visual?: CaseVisual;
  /** Hinweis am Seitenende (z.B. Stand der Lösung) */
  note?: string;
  draft?: boolean;
};

export const CASES: CaseStudy[] = [
  {
    slug: "kohler-elektro",
    category: "auto",
    label: "Automation",
    industry: "Elektroinstallationen, Bern",
    service: "E-Mail-Automation · Zeitrapport",
    status: "Rund ein Jahr im Einsatz",
    title: "Aus jeder E-Mail der richtige Zeitrapport.",
    sub: "Eine Automation liest die Projektnummer aus eingehenden E-Mails und rapportiert die aufgewendete Zeit beim richtigen Projekt, ohne dass jemand daran denken muss.",
    metric: { value: "CHF 2'000 bis 3'000", label: "pro Monat zusätzlich verrechnet" },
    challenge: {
      title: "Verrechenbare Zeit, die nirgends landete.",
      text: [
        "Ein Teil der Projektarbeit passiert per E-Mail. Die Zeit dafür musste von Hand dem richtigen Projekt zugeordnet werden.",
        "Im Alltag geschah das oft nachträglich und geschätzt oder gar nicht. Leistungen, die eigentlich verrechenbar gewesen wären, gingen so schlicht verloren.",
      ],
    },
    solution: {
      title: "Die Projektnummer steht schon in der E-Mail.",
      text: [
        "Wir haben eine Automation entwickelt, die Betreff und Text jeder relevanten E-Mail aus Outlook liest, die Projektnummer erkennt und die Zeit direkt an die bestehende Zeiterfassung übergibt.",
      ],
      points: [
        "Projektnummer wird automatisch aus Betreff und Text erkannt",
        "Zeit landet beim richtigen Projekt, ohne Nachtragen",
        "Angebunden an Outlook und die bestehende Zeiterfassung",
        "Umsetzung in rund 3 bis 4 Wochen",
      ],
    },
    result: {
      title: "Mehr Umsatz aus derselben Arbeit.",
      text: [
        "Statt geschätzter Zeiten lagen exakte Rapporte vor. Leistungen, die vorher verloren gingen, wurden sauber verrechnet. Die Automation hatte sich nach kurzer Zeit amortisiert.",
      ],
      stats: [
        { value: "CHF 2'000 bis 3'000", label: "zusätzlich verrechnet pro Monat" },
        { value: "3 bis 4 Wo.", label: "von der Idee bis zum Einsatz" },
      ],
    },
    visual: { kind: "emailauto" },
  },
  {
    slug: "praxis-vogel",
    category: "oco",
    label: "OneClick Office",
    industry: "Praxis / Beratung",
    service: "Individuelle Software · Abrechnung",
    status: "Im Einsatz seit Anfang 2026",
    title: "Vom Abrechnungstag zur Rechnung auf einen Klick.",
    sub: "Für Luca Vogel haben wir eine Lösung entwickelt, die Zeiterfassung, Spesen und Rechnungsstellung an einem Ort zusammenführt. Daraus ist OneClick Office entstanden.",
    metric: { value: "1 bis 1.5 Tage → 1.5 Std.", label: "Adminaufwand pro Monat" },
    challenge: {
      title: "Abrechnung über drei Werkzeuge.",
      text: [
        "Die Abrechnung lief über mehrere Werkzeuge: Word, Excel und der Kalender. Zeitgemäss war das nicht mehr, effizient schon gar nicht. Jeden Monat kostete das ein bis anderthalb Arbeitstage.",
        "Zeit, die in der Praxis fehlte, und eine Arbeit, die niemand gerne macht.",
      ],
    },
    solution: {
      title: "Alles an einem Ort, auch unterwegs.",
      text: [
        "Wir haben die Lösung individuell auf Lucas Ablauf zugeschnitten: Zeiteinträge macht er direkt nach dem Termin am Handy, Spesen erfasst er per Foto, und die Rechnung entsteht mit einem Klick aus den erfassten Leistungen.",
      ],
      points: [
        "Zeiterfassung mobil, direkt nach dem Termin",
        "Spesen per Foto hinterlegen, egal wo",
        "Rechnung auf einen Klick aus den erfassten Leistungen",
        "Individuell entwickelt, auf den bestehenden Ablauf abgestimmt",
      ],
    },
    result: {
      title: "Aus Tagen werden Stunden.",
      text: [
        "Der monatliche Adminaufwand ist von ein bis anderthalb Arbeitstagen auf rund anderthalb Stunden gesunken. Aus dieser Lösung ist OneClick Office entstanden: das Produkt für Coaches, Berater und Praxen.",
      ],
      stats: [
        { value: "1 bis 1.5 Tage", label: "Adminaufwand pro Monat vorher" },
        { value: "1.5 Std.", label: "Adminaufwand pro Monat heute" },
        { value: "1 Klick", label: "bis zur fertigen Rechnung" },
      ],
    },
    visual: { kind: "oco" },
  },
  {
    slug: "verkehrsschule-mittelland",
    category: "web",
    label: "Webseite",
    industry: "Fahrschule",
    service: "Redesign · Kurs- & Buchungsverwaltung · SEO",
    title: "Ein Auftritt, der zur Zielgruppe passt.",
    sub: "Neue Webseite, ein Verwaltungstool für Kurse und Buchungen und saubere SEO-Grundlagen für eine Fahrschule, die online so professionell wirken soll wie im Unterricht.",
    challenge: {
      title: "Der Auftritt war in die Jahre gekommen.",
      text: [
        "Die bisherige Webseite wirkte in die Jahre gekommen und passte nicht mehr zum Angebot und zur Zielgruppe.",
      ],
    },
    solution: {
      title: "Redesign plus Werkzeug im Hintergrund.",
      text: [
        "Wir haben die Webseite neu gestaltet, klar strukturiert und auf die Zielgruppe ausgerichtet. Dazu kam ein Verwaltungstool, mit dem Kurse und Buchungen an einem Ort gepflegt werden.",
      ],
      points: [
        "Redesign der gesamten Webseite, mobile-first",
        "Verwaltungstool für Kurse und Buchungen",
        "Optimierung der SEO-Grundlagen",
        "Klare Wege zur Anfrage und Anmeldung",
      ],
    },
    result: {
      title: "Modern, zeitgerecht, vertrauenswürdig.",
      text: [
        "Laut den Rückmeldungen von Kundinnen und Kunden wirkt die Webseite heute modern, zeitgerecht und passt zur Zielgruppe. Der Auftritt wirkt vertrauenswürdiger und hat einen positiven Einfluss auf Sichtbarkeit und Anfragen.",
      ],
    },
    visual: { kind: "beforeafter" },
  },
  {
    slug: "sandro-dubach",
    category: "web",
    label: "Buchungstool",
    industry: "Fotografie",
    service: "Buchungstool in bestehende Webseite",
    title: "Kundinnen buchen ihren Fototermin selbst.",
    sub: "Statt Termine per Telefon und E-Mail hin und her zu schieben, buchen Kundinnen und Kunden direkt auf der bestehenden Webseite einen freien Slot.",
    challenge: {
      title: "Termin-Pingpong per Telefon und Mail.",
      text: [
        "Jeder Fototermin begann mit mehreren Nachrichten: Wann passt es? Dienstag nicht, dann Donnerstag? Das kostete Zeit, die eigentlich ins Fotografieren gehört.",
      ],
    },
    solution: {
      title: "Buchungstool, nahtlos eingebaut.",
      text: [
        "Die Webseite blieb, wie sie ist. Wir haben unser Buchungstool direkt in den bestehenden Auftritt integriert. Es ist mit dem Kalender synchronisiert und zeigt nur tatsächlich freie Termine.",
      ],
      points: [
        "Kein Website-Neubau nötig",
        "Kundinnen buchen selbst, auch abends und am Wochenende",
        "Bestätigung und Kalendereintrag laufen automatisch",
        "Nur tatsächlich freie Termine sichtbar",
      ],
    },
    result: {
      title: "Deutlich weniger Administration.",
      text: [
        "Der administrative Aufwand rund um die Terminvereinbarung hat sich deutlich reduziert, und der gesamte Ablauf ist effizienter geworden.",
      ],
    },
    visual: { kind: "booking" },
  },
  {
    slug: "moodpix",
    category: "auto",
    label: "Individuelle Lösung",
    industry: "Fotografie (B2B)",
    service: "B2B-Buchungslink für Firmenkunden",
    title: "Ein Link statt hunderte Termin-Mails.",
    sub: "Für Firmenshootings mit vielen Mitarbeitenden haben wir eine individuelle Lösung entwickelt: Der Kunde teilt einen Link, jede Person bucht ihren Slot selbst.",
    challenge: {
      title: "Hunderte Termine, einzeln koordiniert.",
      text: [
        "Bei Firmenkunden mussten die Fototermine vieler Mitarbeitender abgestimmt werden, über Excel-Listen, E-Mails und Telefon. Jede Verschiebung löste neue Rückfragen aus.",
      ],
    },
    solution: {
      title: "Ein Link für den ganzen Betrieb.",
      text: [
        "Der Fotograf legt Zeitfenster fest und teilt einen Link mit dem Firmenkunden. Jede und jeder Mitarbeitende bucht selbst einen freien Slot, belegte Zeiten sind gesperrt.",
      ],
      points: [
        "Individuell entwickelt für Firmenshootings",
        "Self-Service für alle Mitarbeitenden",
        "Keine Excel-Listen und Doppelbuchungen mehr",
      ],
    },
    result: {
      title: "Koordination ohne Pingpong.",
      text: ["Die manuelle Koordination der Termine entfällt."],
    },
    visual: { kind: "b2b" },
    // ⏳ wartet auf das Zitat von André Scheidegger (siehe @tm/testimonials)
    draft: true,
  },
];

export type CaseWithQuote = CaseStudy & { t?: Testimonial };

/** Veröffentlichte Fallstudien inkl. zugehöriger Kundenstimme */
export function publishedCases(): CaseWithQuote[] {
  return CASES.filter((c) => !c.draft).map((c) => ({ ...c, t: TESTIMONIALS.find((t) => t.slug === c.slug) }));
}

export function findCase(slug: string): CaseWithQuote | undefined {
  return publishedCases().find((c) => c.slug === slug);
}

export const CATEGORY_LABEL: Record<CaseStudy["category"], string> = {
  web: "Webseiten",
  auto: "Automationen",
  oco: "OneClick Office",
};
