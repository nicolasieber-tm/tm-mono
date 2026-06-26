import type { Expense, ExpenseCategory, NavigationPath } from "./types";
import { UNCATEGORIZED_KEY, UNCATEGORIZED_LABEL } from "./types";
import { monthName, parseDateParts } from "./formatters";
import { csvEscape, triggerCsvDownload } from "@/utils/csvDownload";

export function filterExpensesByScope(expenses: Expense[], path: NavigationPath): Expense[] {
  return expenses.filter((e) => {
    const parts = parseDateParts(e.expense_date);
    if (!parts) return false;
    if (path.year != null && parts.year !== path.year) return false;
    if (path.month != null && parts.month !== path.month) return false;
    if (path.category != null) {
      if (path.category === UNCATEGORIZED_KEY) {
        return !e.category || e.category.trim().length === 0;
      }
      return e.category === path.category;
    }
    return true;
  });
}

export function scopeLabel(path: NavigationPath): string {
  if (path.category != null) {
    const cat = path.category === UNCATEGORIZED_KEY ? UNCATEGORIZED_LABEL : path.category;
    return `${cat} · ${monthName(path.month!)} ${path.year}`;
  }
  if (path.month != null) return `${monthName(path.month)} ${path.year}`;
  if (path.year != null) return `Jahr ${path.year}`;
  return "alle Spesen";
}

export function scopeFilename(path: NavigationPath): string {
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9_\-äöüÄÖÜ]/g, "_");
  if (path.category != null) {
    const cat = path.category === UNCATEGORIZED_KEY ? "Unkategorisiert" : path.category;
    return `${safe(cat)}_${safe(monthName(path.month!))}_${path.year}.csv`;
  }
  if (path.month != null) return `Spesen_${safe(monthName(path.month))}_${path.year}.csv`;
  if (path.year != null) return `Spesen_Jahr_${path.year}.csv`;
  return "Spesen_Alle.csv";
}

export function buildCSV(items: Expense[], _categoriesMeta: ExpenseCategory[]): string {
  const headers = [
    "Datum",
    "Beschreibung",
    "Kategorie",
    "Betrag (CHF)",
    "Mitarbeiter",
    "Firma",
    "Quelle",
    "Wiederkehrend",
    "KI-Status",
    "Beleg-URL",
    "Beleg-ID",
  ];

  const lines: string[] = [headers.join(";")];

  for (const e of items) {
    const row = [
      e.expense_date ?? "",
      e.notes ?? "",
      e.category ?? UNCATEGORIZED_LABEL,
      Number(e.amount ?? 0).toFixed(2),
      [e.employees?.first_name, e.employees?.last_name].filter(Boolean).join(" "),
      e.kunden?.name ?? "",
      e.ai_model_used || e.imported_via_bono ? "Automatisch" : "Manuell",
      e.recurrence_frequency === "monthly" || e.is_recurring_monthly
        ? "Monatlich"
        : e.recurrence_frequency === "weekly"
        ? "Wöchentlich"
        : "",
      e.status === "processing"
        ? "In Bearbeitung"
        : e.status === "failed"
        ? "Fehler"
        : "OK",
      e.receipt_image_url ?? "",
      e.id,
    ];
    lines.push(row.map(csvEscape).join(";"));
  }

  lines.push("");
  const total = items.reduce((s, e) => s + Number(e.amount ?? 0), 0);
  lines.push(`Total;;;${total.toFixed(2)};;;;;;;`);

  return lines.join("\n");
}

export { triggerCsvDownload };
