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
  // Zwei Hero-CTAs: primär scrollt zur Live-Demo, sekundär zum Anfrage-Formular.
  ctaPrimary: "Live-Demo austesten",
  ctaSecondary: "Persönliche Einschätzung abholen",
  // Eigener Hero NUR für Mobile (≤767px). Am Handy funktioniert die interaktive
  // Desktop-Demo nicht gut, darum hier klarer Value-Prop + ein CTA, der den
  // Demo-Zugang per E-Mail einsammelt (Ziel: mehr Leads aus mobilem Ad-Traffic).
  mobile: {
    kicker: "KOSTENLOSE LIVE-DEMO",
    headline: "Spare dir den Admin-Tag beim Monatsabschluss.",
    // Zwei Absätze: Value-Prop + Handlungsaufforderung (Demo unten testen / Erstgespräch).
    subheadline: [
      "OneClick Office ist das Abrechnungssystem für selbstständige Coaches und Berater in der Schweiz. Erfasse Zeiten und Belege direkt nach dem Termin am Handy, am Desktop erstellst du daraus mit einem Klick fertige Rechnungen.",
      "Probier die App gleich unten direkt aus – oder buch dir ein kostenloses Erstgespräch.",
    ],
    cta: "Kostenloses Erstgespräch buchen",
    badges: [
      "Schweizer Lösung",
      "revDSG und DSGVO konform",
      "Für Coaches und Berater",
      "Keine komplizierte ERP-Einführung",
    ],
  },
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
  mobileSrc: "/mobile/dashboard",
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
    src: "/abrechnung-desktop.webp",
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
  // Schlankes Optin NUR für Mobile (≤767px): ersetzt am Handy den 4-Fragen-Wizard.
  // Ziel ist der Demo-Zugang per E-Mail – minimale Reibung, nur zwei Pflichtfelder.
  mobile: {
    kicker: "KOSTENLOSER DEMO-ZUGANG",
    headline: "Demo-Zugang kostenlos erhalten.",
    subheadline:
      "Trag dich kurz ein – wir senden dir den Zugang zur Live-Demo per E-Mail, damit du sie in Ruhe am Desktop testen kannst.",
    fields: {
      name: { label: "Name", placeholder: "Vor- und Nachname" },
      email: { label: "E-Mail", placeholder: "name@beispiel.ch" },
      telefon: { label: "Telefon", placeholder: "+41 …" },
      system: { label: "Aktuelles System", placeholder: "z. B. Excel, Bexio, Banana …" },
    },
    rueckrufLabel: "Ich wünsche einen Rückruf",
    hint: "Du erhältst den Demo-Zugang per E-Mail. Telefonisch melden wir uns nur, wenn du deine Telefonnummer angibst oder einen Rückruf wünschst.",
    submitLabel: "Demo-Zugang kostenlos erhalten",
    sendingLabel: "Wird gesendet …",
  },
} as const;

export const danke = {
  headline: "Danke, deine Anfrage ist eingegangen.",
  subheadline:
    "Wir melden uns in den nächsten Tagen telefonisch bei dir und besprechen deine persönliche Einschätzung.",
  backLabel: "Zurück zur Demo",
  // Variante für den Mobile-Flow „Demo-Zugang per E-Mail" (Route /danke?flow=demo).
  demo: {
    headline: "Fast geschafft – dein Demo-Zugang ist unterwegs.",
    subheadline:
      "Wir senden dir den Zugang zur Live-Demo per E-Mail zu. Am besten testest du sie in Ruhe am Desktop.",
    backLabel: "Zurück zur Startseite",
  },
} as const;

export const testimonial = {
  kicker: "DAS SAGEN NUTZER",
  // Zitat aus der bestehenden Luca-LP, hier in Ich-Form. Bei Bedarf anpassen.
  quote:
    "Weniger manuelle Adminarbeit. Mehr Zeit für die Klienten, die mich wirklich brauchen.",
  name: "Luca Vogel",
  role: "Sozialpädagogische Familienbegleitung",
  image: "/luca.webp",
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
