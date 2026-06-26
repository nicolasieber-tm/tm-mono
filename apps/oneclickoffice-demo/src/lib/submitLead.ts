import { createClient } from "@supabase/supabase-js";

// Lead-Daten der Landingpage-Anfrage.
export type LeadPayload = {
  name: string;
  email: string;
  telefon: string;
  klienten_pro_monat: string;
  rechnungserstellung: string;
  zeit_monatsabschluss: string;
  buchhaltungssystem: string;
};

/* ---------------------------------------------------------------------
   Lead-Sink (Supabase).
   Bewusst ein EIGENER, echter Supabase-Client – getrennt vom App-Client,
   der im Demo-Modus nur ein In-Memory-Mock ist und nichts persistiert.

   Zielprojekt: uzsyjoicirquqjejmutf. Tabelle `leads` mit RLS:
   anonyme INSERTs erlaubt, SELECT gesperrt.
   Der anon-key ist öffentlich (RLS schützt die Daten) – Hardcoding ist hier
   bewusst und üblich, analog zum hart verdrahteten VITE_DEMO_MODE.
--------------------------------------------------------------------- */
const LEADS_SUPABASE_URL = "https://uzsyjoicirquqjejmutf.supabase.co";
const LEADS_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6c3lqb2ljaXJxdXFqZWptdXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MTk3MDUsImV4cCI6MjA3NDM5NTcwNX0.I6Fcx1mhwG-7pWXu0tQoNacY-romV_N3bCy_3BNS6L0";

const leadsClient =
  LEADS_SUPABASE_URL && LEADS_SUPABASE_ANON_KEY
    ? createClient(LEADS_SUPABASE_URL, LEADS_SUPABASE_ANON_KEY)
    : null;

export async function submitLead(payload: LeadPayload): Promise<void> {
  if (!leadsClient) {
    // Sink noch nicht verkabelt – Flow trotzdem sauber abschliessen,
    // damit das Formular-UI testbar ist.
    console.warn("[submitLead] Lead-Backend noch nicht konfiguriert:", payload);
    return;
  }

  const { error } = await leadsClient.from("leads").insert({
    ...payload,
    source: "landingpage-demo",
  });

  if (error) throw error;
}
