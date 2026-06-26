import { isWithinRange, type DateRange } from "@/utils/entityFinances";
import { csvEscape } from "@/utils/csvDownload";

/** Spesen mit diesen Status zählen nicht als finalisierte Ausgabe. */
const NON_FINAL_EXPENSE_STATUS = new Set(["processing", "failed"]);

export interface ExportInvoice {
  id: string;
  invoice_number: string;
  total: number | null;
  status: string; // draft | sent | paid
  period_end: string; // ISO
  client_id: string | null;
  company_id: string | null;
}

export interface ExportExpense {
  id: string;
  amount: number | null;
  status: string;
  expense_date: string; // ISO
  category: string | null;
  notes: string | null;
  client_id: string | null;
  company_id: string | null;
}

export interface NameLookups {
  /** client_id → "Vorname Nachname" */
  clientNames: Map<string, string>;
  /** company_id (kunden.id) → Name */
  companyNames: Map<string, string>;
}

export interface ExportMovement {
  id: string;
  type: "income" | "expense";
  date: string; // YYYY-MM-DD
  description: string;
  clientId: string | null;
  clientName: string;
  companyId: string | null;
  companyName: string;
  category: string; // "" bei Einnahmen
  status: string; // roh (paid|sent|draft bzw. Spesen-Status) — für Filter
  statusLabel: string; // lesbar — fürs CSV
  amount: number; // immer positiv
}

export interface ExportFilter {
  range: DateRange;
  clientId: string | null; // null = alle
  companyId: string | null; // null = alle
  type: "all" | "income" | "expense";
  status: "all" | "paid" | "sent" | "draft"; // wirkt nur auf Einnahmen
}

const incomeStatusLabel = (status: string): string => {
  if (status === "paid") return "Bezahlt";
  if (status === "sent") return "Offen";
  if (status === "draft") return "Entwurf";
  return status;
};

const lookup = (map: Map<string, string>, id: string | null): string =>
  (id && map.get(id)) || "";

export function toMovements(
  invoices: ExportInvoice[],
  expenses: ExportExpense[],
  lookups: NameLookups,
): ExportMovement[] {
  const income: ExportMovement[] = invoices.map((i) => ({
    id: i.id,
    type: "income",
    date: (i.period_end || "").slice(0, 10),
    description: `Rechnung ${i.invoice_number}`,
    clientId: i.client_id,
    clientName: lookup(lookups.clientNames, i.client_id),
    companyId: i.company_id,
    companyName: lookup(lookups.companyNames, i.company_id),
    category: "",
    status: i.status,
    statusLabel: incomeStatusLabel(i.status),
    amount: Number(i.total) || 0,
  }));

  const expense: ExportMovement[] = expenses
    .filter((e) => !NON_FINAL_EXPENSE_STATUS.has(e.status))
    .map((e) => ({
      id: e.id,
      type: "expense",
      date: (e.expense_date || "").slice(0, 10),
      description: e.notes?.trim() || e.category?.trim() || "Ausgabe",
      clientId: e.client_id,
      clientName: lookup(lookups.clientNames, e.client_id),
      companyId: e.company_id,
      companyName: lookup(lookups.companyNames, e.company_id),
      category: e.category?.trim() || "",
      status: e.status,
      statusLabel: "OK",
      amount: Number(e.amount) || 0,
    }));

  return [...income, ...expense];
}

export function filterMovements(
  movements: ExportMovement[],
  filter: ExportFilter,
): ExportMovement[] {
  return movements.filter((m) => {
    if (!isWithinRange(m.date, filter.range)) return false;
    if (filter.clientId && m.clientId !== filter.clientId) return false;
    if (filter.companyId && m.companyId !== filter.companyId) return false;
    if (filter.type !== "all" && m.type !== filter.type) return false;
    if (m.type === "income") {
      if (filter.status === "all") {
        // Entwürfe sind nur enthalten, wenn explizit Status "Entwurf" gewählt ist.
        if (m.status === "draft") return false;
      } else if (m.status !== filter.status) {
        return false;
      }
    }
    return true;
  });
}

const CSV_HEADERS = [
  "Datum",
  "Typ",
  "Beleg/Beschreibung",
  "Klient",
  "Kunde",
  "Kategorie",
  "Status",
  "Betrag (CHF)",
];

export function buildFinanceCSV(movements: ExportMovement[]): string {
  const lines: string[] = [CSV_HEADERS.join(";")];

  for (const m of movements) {
    const row = [
      m.date,
      m.type === "income" ? "Einnahme" : "Ausgabe",
      m.description,
      m.clientName,
      m.companyName,
      m.category,
      m.statusLabel,
      m.amount.toFixed(2),
    ];
    lines.push(row.map(csvEscape).join(";"));
  }

  const incomeSum = movements
    .filter((m) => m.type === "income")
    .reduce((s, m) => s + m.amount, 0);
  const expenseSum = movements
    .filter((m) => m.type === "expense")
    .reduce((s, m) => s + m.amount, 0);

  lines.push("");
  lines.push(`Total Einnahmen;;;;;;;${incomeSum.toFixed(2)}`);
  lines.push(`Total Ausgaben;;;;;;;${expenseSum.toFixed(2)}`);
  lines.push(`Saldo;;;;;;;${(incomeSum - expenseSum).toFixed(2)}`);

  return lines.join("\n");
}

export function exportFilename(filter: ExportFilter, todayISO: string): string {
  const { from, to } = filter.range;
  if (from && to) return `Finanzen_${from}_${to}.csv`;
  if (from) return `Finanzen_ab_${from}.csv`;
  if (to) return `Finanzen_bis_${to}.csv`;
  return `Finanzen_Alle_${todayISO}.csv`;
}
