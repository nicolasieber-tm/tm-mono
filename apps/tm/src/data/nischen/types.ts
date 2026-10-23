/* =================================================================
   Branchen-Landingpages (z. B. /handwerk)

   Aufbau und Design liegen in src/pages/Nische.tsx; pro Branche (oder
   später pro Gewerk, z. B. /handwerk/elektro) gibt es nur eine
   Konfiguration mit Texten, Problem-Karten, Referenz und FAQ.
   Neue Variante = neue Datei hier + Eintrag in NISCHEN (index.ts).
   ================================================================= */

import type { Faq } from "@/components/site/blocks";

export type Nische = {
  /** URL ohne führenden Slash, z. B. "handwerk" oder "handwerk/elektro" */
  path: string;
  /** Kennung im Tracking (lp_events.source = "tm-<slug>") */
  slug: string;
  /** Kurzname fürs Menü */
  navLabel: string;
  navDesc: string;
  meta: { title: string; description: string };

  hero: {
    kick: string;
    title: string;
    /** Teil der Headline im Verlauf */
    titleAccent: string;
    sub: string;
    trust: { ic: string; t: string; d: string }[];
  };

  pains: { kick: string; h: string; intro?: string; items: { illo: string; tag: string; title: string; desc: string }[] };

  /** Referenz: Fallstudie aus src/data/cases.ts (slug) plus Kennzahlen */
  proof: {
    caseSlug: string;
    kick: string;
    h: string;
    metric: string;
    metricLabel: string;
    yearly: string;
  };

  modules: {
    kick: string;
    h: string;
    intro?: string;
    items: { step: string; ic: string; title: string; desc: string; result: string; proven?: string }[];
    integration: string;
    integrationSub?: string;
  };

  calc: {
    kick: string;
    h: string;
    intro: string;
    /** Bezeichnung für die erste Eingabe (Personen, deren Zeit zählt) */
    peopleLabel: string;
    defaults: { people: number; minutes: number; rate: number };
    days: number;
    resultText: string;
  };

  process: { kick: string; h: string; items: { t: string; d: string }[] };
  faqs: Faq[];

  contact: {
    title: string;
    lead: string;
    person: { name: string; role: string; img: string; mail: string; phone?: string };
  };
};
