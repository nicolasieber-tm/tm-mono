/* =================================================================
   @tm/testimonials — geteilte Datenquelle für Kundenstimmen.
   Single source of truth für alle Apps (tm / sichtbarkeit / auron / …).
   Präsentation (Komponente + CSS) lebt pro App mit deren Skin.
   Design-Werkstatt & Einbau-Doku: apps/tm/design/testimonials.{html,md}

   Enthält NUR echte, freigegebene Testimonials mit fertigem Zitat.
   Demo-/Platzhalter-Einträge bleiben in der Werkstatt-HTML.
   ================================================================= */

export type TestimonialProduct = "web" | "auron" | "auto" | "oco";

export type Testimonial = {
  /** steuert Farb-Akzent + Filter */
  product: TestimonialProduct;
  /** überschreibt den angezeigten Tag-Text (Farbe/Faden bleiben am `product`);
   *  z.B. "Webseite · Terminbuchung", um die konkrete Leistung sichtbar zu machen */
  tag?: string;
  /** Zitat; <span class="hl">…</span> hebt eine Phrase im Produkt-Gradient hervor */
  quote: string;
  /** optionale Vorher → Heute-Story (kurz halten!) */
  before?: string;
  after?: string;
  /** optionale Kennzahl statt/zusätzlich zur Vorher-Heute-Story */
  metric?: { value: string; label: string };
  name: string;
  role?: string;
  company?: string;
  /** Personenfoto (runder Avatar; sonst Initialen) */
  photo?: string;
  /** Firmenlogo oben rechts im Kopf */
  logo?: string;
  /** Logo folgt noch → zeigt solange den Firmennamen als Text */
  logoPending?: boolean;
  /** macht das Logo klickbar (target=_blank) */
  website?: string;
  /** breite Karte (max. 1 empfohlen) */
  featured?: boolean;
};

/** Anzeigename der Produkt-Kategorie (Tag + Filter-Pill) */
export const PRODUCT_LABEL: Record<TestimonialProduct, string> = {
  web: "Webseite",
  auron: "Auron",
  auto: "Automatisierung",
  oco: "OneClick Office",
};

export const TESTIMONIALS: Testimonial[] = [
  /* ---- Mehmet, Verkehrsschule Mittelland (Webseite) — Freigabe Name + Logo erteilt ---- */
  {
    product: "web",
    quote:
      'Die Seite wirkt heute <span class="hl">viel professioneller und moderner</span> als vorher und das Feedback von Kunden ist durchwegs positiv. Sie wirkt vertrauenswürdiger und hat einen positiven Einfluss auf meine Sichtbarkeit und die Anfragen. Wer Wert auf eine unkomplizierte Zusammenarbeit legt, ist hier in guten Händen.',
    before: "Auftritt wirkte in die Jahre gekommen",
    after: "Modern, professionell, vertrauenswürdig",
    name: "Mehmet",
    role: "Inhaber, Verkehrsschule Mittelland",
    company: "Verkehrsschule Mittelland",
    photo: "/referenz_mehmet_bild.jpeg",
    logo: "/referenz_verkehrsschule-mittelland_logo.png",
    website: "https://www.verkehrsschule-mittelland.ch/",
  },

  /* ---- Sandro Dubach, Sandro Dubach Fotografie (Webseite + integriertes Buchungstool) — O-Ton 2026-07-09 ---- */
  {
    product: "web",
    tag: "Webseite · Terminbuchung",
    quote:
      'Seit ich das Buchungstool auf meiner Website nutze, hat sich <span class="hl">mein administrativer Aufwand deutlich reduziert</span>. Meine Kundinnen und Kunden können ihre Termine unkompliziert selbst buchen, was mir viel Zeit spart und den gesamten Ablauf effizienter macht. Ich bin mit der Lösung sehr zufrieden und kann das Tool allen empfehlen, die ihre Terminverwaltung vereinfachen möchten.',
    before: "Termine per Telefon & Mail-Pingpong",
    after: "Kundinnen buchen Fototermine selbst online",
    name: "Sandro Dubach",
    role: "Inhaber, Sandro Dubach Fotografie",
    company: "Sandro Dubach Fotografie",
    photo: "/referenz_sandro-dubach_bild.webp",
    logo: "/referenz_sandro-dubach_fotografie_logo.webp",
    website: "https://www.sandrodubach.ch/",
  },

  /* ---- Beat Gerber, Kohler Elektro Bern AG (Automatisierung) — Zitat fürs Card gekürzt ---- */
  {
    product: "auto",
    quote:
      'Trending Media hat eine Automation entwickelt, die die Projektnummer direkt aus meinen E-Mails erkennt und die Zeit automatisch rapportiert. Jede relevante E-Mail wird zuverlässig dem richtigen Projekt zugeordnet, ohne dass ich selbst daran denken muss. <span class="hl">So verrechne ich monatlich rund CHF 2\'000 bis 3\'000 zusätzlich</span>, Leistungen, die vorher schlicht verloren gingen.',
    before: "Zeiten von Hand zugeordnet, oft geschätzt",
    after: "Automatisch dem richtigen Projekt rapportiert",
    name: "Beat Gerber",
    role: "Geschäftsführer, Kohler Elektro Bern AG",
    company: "Kohler Elektro Bern AG",
    photo: "/beatgerber_kundenstimme.jpg",
    logo: "/referenz_kohler-elektro-bern_logo.png",
    // website: "https://…",   // ⏳ Kohler-Website ergänzen (macht Logo klickbar)
  },

  /* ---- Luca Vogel, Praxis Vogel GmbH (OneClickOffice) — Zitat aus Frage-Antwort-Katalog verdichtet ---- */
  {
    product: "oco",
    quote:
      'Früher lief meine Abrechnung über Word, Excel und den Kalender, nicht mehr wirklich zeitgemäss und alles andere als effizient. Heute habe ich alles an einem Ort: Spesen hinterlege ich direkt per Foto, egal wo ich gerade bin und die Zeiteinträge mache ich entspannt nach den Terminen am Handy. Am meisten schätze ich <span class="hl">die Rechnung auf einen Klick</span>, das spart mir jeden Monat enorm viel Aufwand.',
    before: "1 bis 1.5 Tage Adminaufwand",
    after: "2 Stunden",
    name: "Luca Vogel",
    role: "Inhaber, Praxis Vogel GmbH",
    company: "Praxis Vogel GmbH",
    photo: "/referenz_luca-vogel_bild.jpg",
    logo: "/referenz_praxis-vogel_logo.png",
    // website: "https://…",   // ⏳ Website-URL ergänzen (macht Logo klickbar)
  },

  /* ---- André Scheidegger, Moodpix GmbH (Automatisierung / B2B-Buchungslink) — Freigabe zugesagt ----
     ⏳ O-Ton folgt. Sobald das Zitat da ist: diesen Block einkommentieren, `quote` setzen
        (und Logo ergänzen → `logoPending` entfernen). Foto liegt bereits in apps/tm/public.
  {
    product: "auto",
    quote: "…echter O-Ton von André…",
    before: "Terminchaos bei hunderten Mitarbeitenden",
    after: "Ein Link, jeder bucht seinen Slot",
    name: "André Scheidegger",
    role: "Inhaber, Moodpix GmbH",
    company: "Moodpix GmbH",
    photo: "/referenz_andre-scheidegger_bild.jpg",
    logoPending: true,
  },
  */
];
