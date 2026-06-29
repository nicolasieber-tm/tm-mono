// Schritt-Definitionen der geführten Live-Demo-Tour.
// Reine Daten — die Engine (TourProvider/TourOverlay) interpretiert sie.
//
// target: CSS-Selektor des hervorzuhebenden Elements (vorhandene `id`s oder
//          ergänzte `data-tour`-Anker). null = kein Spotlight (Intro/Abschluss,
//          Karte erscheint zentriert).
// route:  react-router-Pfad, auf den vor dem Schritt navigiert wird.

export type TourVariant = "mobile" | "desktop";

export interface TourStep {
  route: string;
  target: string | null;
  title: string;
  body: string;
}

// Mobile-Tour — der Alltag unterwegs: erfassen, fotografieren, ablegen.
const mobile: TourStep[] = [
  {
    route: "/mobile/zeit",
    target: '[data-tour="mobile-nav"]',
    title: "Alles mit dem Daumen erreichbar",
    body: "Zeit, Spesen, Notizen und Profil – die vier Dinge, die du unterwegs brauchst, immer griffbereit unten.",
  },
  {
    route: "/mobile/zeit",
    target: "#company",
    title: "Zeit erfassen in Sekunden",
    body: "Firma und Klient wählen, Dauer eintragen, speichern. Direkt nach dem Coaching erledigt, noch bevor du losfährst.",
  },
  {
    route: "/mobile/zeit",
    target: "#session-note",
    title: "Sitzungsnotiz gleich dazu",
    body: "Wichtiges zum Klienten kurz festhalten – die Notiz landet automatisch in seiner Akte.",
  },
  {
    route: "/mobile/spesen",
    target: '[data-tour="receipt-camera"]',
    title: "Beleg einfach fotografieren",
    body: "Quittung abfotografieren, der Betrag wird automatisch erkannt. Kein loser Zettel geht mehr verloren.",
  },
  {
    route: "/mobile/notizen",
    target: '[data-tour="notes-explorer"]',
    title: "Alles am richtigen Ort",
    body: "Jede Notiz sauber nach Unternehmen und Klient abgelegt – jederzeit wiederfindbar.",
  },
  {
    route: "/mobile/zeit",
    target: null,
    title: "Das war's unterwegs",
    body: "Alles ist erfasst. Am Monatsende rechnest du am Computer mit einem Klick ab. Klick dich jetzt frei durch die Demo.",
  },
];

// Desktop-Tour — der Monatsabschluss: aus erfassten Zeiten in einem Klick Rechnungen.
const desktop: TourStep[] = [
  {
    route: "/dashboard",
    target: '[data-tour="dashboard-stats"]',
    title: "Dein Überblick",
    body: "Einnahmen, Ausgaben und offene Rechnungen – der Stand deines Geschäfts auf einen Blick.",
  },
  {
    route: "/zeiterfassung",
    target: '[data-tour="zeit-table"]',
    title: "Alle Zeiten an einem Ort",
    body: "Die unterwegs erfassten Stunden laufen hier zusammen – die Grundlage für die Abrechnung.",
  },
  {
    route: "/rechnungen",
    target: "#invoice-generate-month",
    title: "Monat wählen",
    body: "Du bestimmst den Abrechnungsmonat – zum Beispiel den laufenden.",
  },
  {
    route: "/rechnungen",
    target: '[data-tour="generate-preview"]',
    title: "Vorschau vor dem Klick",
    body: "OneClick Office zeigt dir vorab, wie viele offene Einträge vorliegen und wie viele Rechnungen daraus entstehen.",
  },
  {
    route: "/rechnungen",
    target: '[data-tour="generate-button"]',
    title: "Ein Klick – fertig abgerechnet",
    body: "Dieser Klick erstellt alle Rechnungen aus den erfassten Zeiten. Genau das spart dir jeden Monat den Admin-Tag.",
  },
  {
    route: "/rechnungen",
    target: null,
    title: "Das ist OneClick Office",
    body: "Unterwegs erfasst, am Monatsende mit einem Klick abgerechnet. Klick dich jetzt frei durch die Demo.",
  },
];

export const tourSteps: Record<TourVariant, TourStep[]> = { mobile, desktop };
