import type { ClientHierarchyMode } from "@/hooks/useClientHierarchyMode";

export type Placeholder = {
  token: string;
  label: string;
  category: "invoice" | "company" | "client" | "time" | "misc";
};

const BASE: Placeholder[] = [
  { token: "{{invoice_number}}", label: "Rechnungsnummer", category: "invoice" },
  { token: "{{invoice_date}}", label: "Rechnungsdatum", category: "invoice" },
  { token: "{{invoice_due_date}}", label: "Fälligkeit", category: "invoice" },
  { token: "{{invoice_total}}", label: "Rechnungstotal", category: "invoice" },
  { token: "{{company_name}}", label: "Kundenname", category: "company" },
  { token: "{{company_address}}", label: "Kundenadresse", category: "company" },
  { token: "{{company_zip}}", label: "Kunden-PLZ", category: "company" },
  { token: "{{company_city}}", label: "Kunden-Ort", category: "company" },
  { token: "{{company_country}}", label: "Kunden-Land", category: "company" },
  { token: "{{time_entries}}", label: "Leistungstabelle", category: "time" },
  { token: "{{period_start}}", label: "Zeitraum Start", category: "time" },
  { token: "{{period_end}}", label: "Zeitraum Ende", category: "time" },
];

const CLIENT_ONLY: Placeholder[] = [
  { token: "{{client_name}}", label: "Klient-Name (voll)", category: "client" },
  { token: "{{client_first_name}}", label: "Klient-Vorname", category: "client" },
  { token: "{{client_last_name}}", label: "Klient-Nachname", category: "client" },
  { token: "{{client_birthdate}}", label: "Klient-Geburtsdatum", category: "client" },
];

export function getAvailablePlaceholders(
  mode: ClientHierarchyMode,
): Placeholder[] {
  if (mode === "two_level") {
    return [...BASE, ...CLIENT_ONLY];
  }
  return BASE;
}
