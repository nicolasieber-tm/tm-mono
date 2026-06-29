// Zentrale Content-Datei der Landingpage (Route /).
// ALLE Marketing-Texte hier – Section-Titel etc. sind Platzhalter und müssen
// später mit den tatsächlich geschalteten Ads abgestimmt werden.

export const hero = {
  kicker: "LIVE-DEMO · OHNE ANMELDUNG",
  // headlineLines: einzelne Zeilen, "accent" hebt das Wort farbig hervor.
  headlineLines: [
    { text: "Am Handy erfasst.", accent: false },
    { text: "Am Desktop abgerechnet.", accent: false },
    { text: "In einem Klick.", accent: true },
  ],
  subheadline:
    "OneClick Office ist das Abrechnungs-System für selbstständige Coaches & Berater in der Schweiz. Erfasse Zeiten und Belege unterwegs am Handy, am Schreibtisch rechnest du mit einem Klick ab. Klick dich unten direkt durch die Demo.",
  // Trust-Badges direkt unter dem Hero.
  badges: [
    "revDSG / DSGVO-konform",
    "Integration in Buchhaltungssysteme",
    "Schweizer Lösung",
  ],
  demoHint: "Unten kannst du die echte Demo direkt durchklicken, ganz ohne Anmeldung.",
} as const;

export const demo = {
  kicker: "DIE LIVE-DEMO",
  headline: "Klick dich durch OneClick Office.",
  // Geräteabhängige Subheadline (Desktop = Abrechnen, Mobile = Erfassen).
  subheadlineDesktop:
    "Das ist die echte Anwendung, kein Video, kein Screenshot. Schau dir an, wie aus erfassten Zeiten und Belegen mit einem Klick fertige Rechnungen werden.",
  subheadlineMobile:
    "Das ist die echte Handy-App, kein Video. Erfasse Zeiten und fotografiere Belege so, wie du es unterwegs direkt nach dem Termin tust.",
  activateLabel: "Geführte Tour starten",
  browserUrl: "demo.oneclick-office.ch",
  hint: "Du kannst die Tour jederzeit beenden und dich frei durch die Demo klicken.",
  // Start-Routen der eingebetteten Demo je Gerät.
  desktopSrc: "/dashboard",
  mobileSrc: "/mobile/zeit",
} as const;

export const aha = {
  kicker: "VOM TERMIN ZUR RECHNUNG",
  headline: "Das ist der ganze Aufwand.",
  subheadline:
    "Genau dieser Ablauf spart dir jeden Monat den Admin-Tag: unterwegs erfassen, am Ende mit einem Klick abrechnen, ohne Excel, ohne Zettelwirtschaft, ohne Nachbearbeiten.",
  // Nur Mobile: Am Handy zeigt die Live-Demo die Erfassung. Damit Handy-Besucher
  // auch den Abrechnungs-Moment am PC sehen, blenden wir hier den Desktop-Screenshot ein.
  mobileShot: {
    caption: "Am Monatsende am PC: Klient & Monat wählen, ein Klick, Rechnungen fertig.",
    src: "/abrechnung-desktop.png",
    alt: "Rechnungen mit einem Klick generieren in der Desktop-Ansicht von OneClick Office",
    browserUrl: "demo.oneclick-office.ch",
  },
  // Ergänzende Kernvorteile neben der Abrechnung (Spesen, zentrale Übersicht).
  benefits: [
    {
      title: "Spesen? Einfach abfotografieren.",
      text: "Beleg knipsen, fertig. Keine losen Belege, kein Sortieren, nichts geht mehr verloren.",
    },
    {
      title: "Alles an einem Ort.",
      text: "Zeiten, Spesen, Belege und Rechnungen laufen zusammen, dazu die ganze Klientenakte mit Notizen und Verlauf. Eine Übersicht statt Zettel, Excel und Ordner.",
    },
  ],
} as const;

export const cta = {
  kicker: "DEIN NÄCHSTER SCHRITT",
  // Platzhalter – Titel/Subtitel später mit den geschalteten Ads abstimmen.
  headline: "Hol dir deine persönliche Einschätzung.",
  subheadline:
    "Beantworte vier kurze Fragen, wir melden uns telefonisch und zeigen dir, wie viel Zeit dir OneClick Office bei deinem Monatsabschluss spart.",
  // Qualifizierungs-Fragen (key = späteres Lead-Feld).
  questions: [
    {
      key: "klienten_pro_monat",
      label: "Wie viele Klienten rechnest du pro Monat ungefähr ab?",
      options: ["1 bis 5", "6 bis 15", "16 bis 30", "über 30"],
    },
    {
      key: "rechnungserstellung",
      label: "Wie erstellst du aktuell deine Rechnungen?",
      options: ["Word / Excel von Hand", "Buchhaltungssoftware", "Treuhänder / extern", "Anders"],
    },
    {
      key: "zeit_monatsabschluss",
      label: "Wie viel Zeit brauchst du etwa für den Monatsabschluss?",
      options: ["Unter 2 Stunden", "Ein halber Tag", "Ein ganzer Tag", "Mehrere Tage"],
    },
    {
      key: "buchhaltungssystem",
      label: "Welches Buchhaltungssystem nutzt du?",
      options: ["Banana", "Bexio", "Sage / Abacus", "Excel / keines", "Anderes"],
    },
  ],
  submitLabel: "Anfrage absenden",
  sendingLabel: "Wird gesendet …",
  privacyNote:
    "Deine Angaben behandeln wir vertraulich (revDSG / DSGVO) und nutzen sie nur, um dich zu kontaktieren.",
} as const;

export const danke = {
  headline: "Danke, deine Anfrage ist eingegangen.",
  subheadline:
    "Wir melden uns in den nächsten Tagen telefonisch bei dir und besprechen deine persönliche Einschätzung.",
  backLabel: "Zurück zur Demo",
} as const;

export const testimonial = {
  kicker: "DAS SAGEN NUTZER",
  // Zitat aus der bestehenden Luca-LP, hier in Ich-Form. Bei Bedarf anpassen.
  quote:
    "Weniger manuelle Adminarbeit. Mehr Zeit für die Klienten, die mich wirklich brauchen.",
  name: "Luca Vogel",
  role: "Sozialpädagogische Familienbegleitung",
  image: "/luca.jpg",
  // Vorher → Nachher: was sich mit OneClick Office konkret verändert hat.
  transformation: [
    { before: "Word, Excel, Kalender, alles verzettelt", after: "Ein System, ein Klick" },
    { before: "1 bis 1,5 Arbeitstage Admin pro Monat", after: "Noch rund 2 Stunden" },
    {
      before: "Belege und Klienteninfos an verschiedenen Orten",
      after: "Alles an einem Ort, jederzeit griffbereit",
    },
    {
      before: "Stunden am Monatsende zusammensuchen",
      after: "Direkt nach dem Termin am Handy erfasst",
    },
  ],
} as const;

export const footer = {
  tagline: "Weniger Administration. Mehr Freiheit.",
  copyright: "© 2026 OneClick Office. Alle Rechte vorbehalten.",
} as const;
