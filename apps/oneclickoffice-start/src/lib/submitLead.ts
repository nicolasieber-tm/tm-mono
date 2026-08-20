/**
 * Lead-Sink der Kampagnen-Landingpage.
 * ------------------------------------
 * Schreibt direkt gegen die PostgREST-API von Supabase — bewusst OHNE
 * @supabase/supabase-js: die Lib kostet rund 40 KB gzip, und gebraucht wird
 * hier ein einziger INSERT. Auf einer Ads-Landingpage ist das den Verzicht wert.
 *
 * Zielprojekt: uzsyjoicirquqjejmutf, Tabelle `leads` — dieselbe, in die auch
 * demo.oneclick-office.ch schreibt. RLS erlaubt anonyme INSERTs, SELECT ist
 * gesperrt; der anon-Key ist deshalb öffentlich und darf im Bundle stehen
 * (identisch zum Vorgehen in apps/oneclickoffice-demo/src/lib/submitLead.ts).
 *
 * Über das Feld `source` lassen sich die Funnel später sauber auseinanderhalten:
 *   landingpage-demo         → Desktop-Wizard der Demo-Seite
 *   landingpage-demo-mobile  → Mobile-Optin der Demo-Seite (löst die Demo-Mail aus)
 *   lp-start                 → diese Seite (start.oneclick-office.ch)
 */

const LEADS_SUPABASE_URL = "https://uzsyjoicirquqjejmutf.supabase.co";
const LEADS_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6c3lqb2ljaXJxdXFqZWptdXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MTk3MDUsImV4cCI6MjA3NDM5NTcwNX0.I6Fcx1mhwG-7pWXu0tQoNacY-romV_N3bCy_3BNS6L0";

/** Kennzeichnet alle Leads dieser Seite. */
export const LEAD_SOURCE = "lp-start";

export type LeadPayload = {
  name: string;
  email: string;
  telefon: string;
  /** Gemeinsame Kennung für Browser-Pixel und Conversions API (Deduplizierung). */
  meta_event_id?: string;
  /** Browser-Angaben, die der Server für die Conversions API braucht. */
  meta_context?: Record<string, unknown>;
};

export async function submitLead(
  payload: LeadPayload,
  source: string = LEAD_SOURCE,
): Promise<void> {
  const response = await fetch(`${LEADS_SUPABASE_URL}/rest/v1/leads`, {
    method: "POST",
    headers: {
      apikey: LEADS_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${LEADS_SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      // Kein Rücklesen des Datensatzes — SELECT ist per RLS ohnehin gesperrt.
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      telefon: payload.telefon.trim(),
      source,
      meta_event_id: payload.meta_event_id ?? null,
      meta_context: payload.meta_context ?? {},
    }),
  });

  if (!response.ok) {
    // Antworttext mitnehmen — bei Schemafehlern steht dort die eigentliche
    // Ursache (z. B. eine Spalte, die es nicht gibt).
    const detail = await response.text().catch(() => "");
    throw new Error(`Lead-Insert fehlgeschlagen (${response.status}): ${detail}`);
  }
}
