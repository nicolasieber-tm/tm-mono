import type { Nische } from "./types";

/* Branchen-Landingpage Handwerk & Technik (Briefing Oktober 2026).
   Zielgruppe: Betriebe mit 10 bis 50 Mitarbeitenden in der Deutschschweiz.
   Bewusst nicht auf dieser Seite: Webseiten/Buchungstools als Leistung,
   Solo-Referenzen, OneClick Office, AURON. */

export const HANDWERK: Nische = {
  path: "handwerk",
  slug: "handwerk",
  navLabel: "Für Handwerksbetriebe",
  navDesc: "Rapporte, Offerten und Anfragen automatisieren",
  meta: {
    title: "Automatisierung für Handwerksbetriebe · Trending Media",
    description:
      "Weniger Büro, mehr Baustelle. Wir automatisieren Rapporte, Offerten und Anfragen für Handwerksbetriebe, ohne Ihre bestehende Software zu ersetzen.",
  },

  hero: {
    kick: "Für Handwerks- und Technikbetriebe",
    title: "Weniger Büro.",
    titleAccent: "Mehr Baustelle.",
    sub: "Wir automatisieren Rapporte, Offerten und Anfragen für Handwerksbetriebe, damit jede geleistete Stunde verrechnet wird und Ihr Feierabend wieder Feierabend ist. Ihre bestehende Software bleibt.",
    trust: [
      { ic: "pin", t: "Persönlich & lokal", d: "aus Solothurn" },
      { ic: "server", t: "Daten in CH/EU", d: "revDSG-konform" },
      { ic: "users", t: "Umsetzung im eigenen Team", d: "ein fester Ansprechpartner" },
    ],
  },

  pains: {
    kick: "Kommt Ihnen das bekannt vor?",
    h: "Gute Arbeit auf der Baustelle. Liegengebliebenes im Büro.",
    items: [
      { illo: "stale", tag: "Rapporte", title: "Rapporte am Freitagabend", desc: "Die Woche wird aus dem Gedächtnis nachgeschrieben. Was vergessen geht, wird nie verrechnet." },
      { illo: "slow", tag: "Offerten", title: "Offerten am Wochenende", desc: "Tagsüber auf der Baustelle, abends am Laptop. Und das Nachfassen bleibt sowieso liegen." },
      { illo: "silo", tag: "Anfragen", title: "Anfragen, die versanden", desc: "Kontaktformular, Telefon, Mail, WhatsApp. Bis jemand antwortet, hat der Kunde schon die Konkurrenz angefragt." },
      { illo: "doubleEntry", tag: "Doppelerfassung", title: "Alles doppelt erfasst", desc: "Die gleichen Daten landen von Hand im Rapport, in der Offerte und in der Buchhaltung." },
    ],
  },

  proof: {
    caseSlug: "kohler-elektro",
    kick: "Aus der Praxis",
    h: "Kohler Elektro Bern AG verrechnet heute mehr. Aus derselben Arbeit.",
    metric: "+ CHF 2'000 bis 3'000",
    metricLabel: "pro Monat zusätzlich verrechnet",
    yearly: "Das sind bis zu CHF 36'000 pro Jahr.",
  },

  modules: {
    kick: "Was wir automatisieren",
    h: "Von der Anfrage bis zur Wartung.",
    intro: "Drei Stellen in der Auftragsabwicklung, an denen heute am meisten Zeit und Geld liegen bleibt.",
    items: [
      {
        step: "Vor dem Auftrag",
        ic: "chat",
        title: "Anfrage & Offerte",
        desc: "Geführte Anfragen mit allen nötigen Angaben und Fotos, vorbereitete Offerten und automatisches Nachfassen.",
        result: "Schneller antworten, mehr Aufträge gewinnen.",
      },
      {
        step: "Während des Auftrags",
        ic: "clock",
        title: "Rapport & Verrechnung",
        desc: "Zeiten und Material werden automatisch dem richtigen Projekt zugeordnet und an die Buchhaltung übergeben.",
        result: "Keine verlorenen Stunden, schneller fakturieren.",
        proven: "Im Einsatz bei Kohler Elektro",
      },
      {
        step: "Nach dem Auftrag",
        ic: "cal",
        title: "Service & Wartung",
        desc: "Kunden werden automatisch an fällige Wartungen erinnert und buchen selbst einen Termin.",
        result: "Wiederkehrender Umsatz, der heute liegen bleibt.",
      },
    ],
    integration: "Wir ersetzen nichts, was funktioniert.",
    integrationSub:
      "Unsere Lösungen verbinden sich mit der Software, die Sie bereits nutzen. Hat Ihr System eine Schnittstelle, binden wir es an. Ob das bei Ihnen der Fall ist, klären wir im Erstgespräch.",
  },

  calc: {
    kick: "Rechner",
    h: "Was kostet Sie der Admin heute?",
    intro: "Drei Zahlen genügen. Rechnen Sie mit Ihren eigenen Werten.",
    peopleLabel: "Mitarbeitende im Aussendienst",
    defaults: { people: 15, minutes: 10, rate: 100 },
    days: 220,
    resultText:
      "So viel Zeit fliesst heute in Administration statt in verrechenbare Arbeit. Im Erstgespräch zeigen wir Ihnen, wie viel davon sich zurückholen lässt.",
  },

  process: {
    kick: "Vorgehen",
    h: "Klar im Ablauf. Fix im Preis.",
    items: [
      { t: "Erstgespräch", d: "30 Minuten, kostenlos. Wir hören zu und sagen ehrlich, ob wir helfen können." },
      { t: "Prozess-Check", d: "Wir nehmen Ihren Ablauf auf und rechnen gemeinsam aus, was Sie das Problem heute kostet." },
      { t: "Umsetzung zum Festpreis", d: "Kein offenes Stundenbudget. Sie wissen vorher, was es kostet." },
      { t: "Betreuung", d: "Wir bleiben Ansprechpartner, auch nach dem Go-Live." },
    ],
  },

  faqs: [
    { q: "Was kostet ein Projekt?", a: "Projekte starten ab CHF 5'900 zum Festpreis. Im Erstgespräch schätzen wir ab, was in Ihrem Fall sinnvoll ist." },
    { q: "Müssen wir unsere Software wechseln?", a: "Nein. Wir ergänzen und verbinden, was Sie bereits nutzen. Hat Ihre Software eine Schnittstelle, können wir daran anbinden." },
    { q: "Wie lange dauert die Umsetzung?", a: "Erste Lösungen sind oft nach 3 bis 6 Wochen im Einsatz. Bei Kohler Elektro waren es 3 bis 4 Wochen." },
    { q: "Müssen meine Mitarbeitenden etwas Neues lernen?", a: "Möglichst wenig. Die Automationen laufen im Hintergrund, Ihre Leute arbeiten weiter in Outlook und der gewohnten Software. Wo etwas Neues dazukommt, führen wir es persönlich ein." },
    { q: "Wo werden die Daten gespeichert?", a: "In der Schweiz oder in der EU, revDSG-konform." },
  ],

  contact: {
    title: "Wie viele Stunden verlieren Sie jede Woche?",
    lead: "Finden wir es in 30 Minuten heraus. Ehrlich und unverbindlich.",
    person: {
      name: "Nicola Sieber",
      role: "Ihr Ansprechpartner",
      img: "/team/nicola.png",
      mail: "info@trendingmedia.ch",
      // phone: "+41 …"  → sobald gesetzt, erscheint die Nummer in Hero und Kontakt
    },
  },
};
