import type {
  Expense,
  YearFolder,
  MonthFolder,
  CategoryFolder,
  ExpenseCategory,
} from "./types";
import { UNCATEGORIZED_KEY, UNCATEGORIZED_LABEL } from "./types";
import { monthName, parseDateParts } from "./formatters";

/**
 * Groups expenses by year (ascending: oldest → newest).
 * Expenses with unparseable dates are skipped.
 */
export function groupExpensesByYear(
  expenses: Expense[],
  currentYear: number
): YearFolder[] {
  const map = new Map<number, Expense[]>();
  for (const e of expenses) {
    const parts = parseDateParts(e.expense_date);
    if (!parts) continue;
    const existing = map.get(parts.year) ?? [];
    existing.push(e);
    map.set(parts.year, existing);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, items]) => ({
      key: String(year),
      label: String(year),
      year,
      count: items.length,
      total: sumAmounts(items),
      isCurrent: year === currentYear,
    }));
}

/**
 * Groups expenses of one year by month (ascending: 01 → 12).
 * Empty months are omitted. Current month (only when viewing current year) is flagged.
 */
export function groupExpensesByMonth(
  expenses: Expense[],
  year: number,
  currentYear: number,
  currentMonth: number
): MonthFolder[] {
  const map = new Map<number, Expense[]>();
  for (const e of expenses) {
    const parts = parseDateParts(e.expense_date);
    if (!parts || parts.year !== year) continue;
    const existing = map.get(parts.month) ?? [];
    existing.push(e);
    map.set(parts.month, existing);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([month, items]) => ({
      key: `${year}-${String(month).padStart(2, "0")}`,
      label: monthName(month),
      year,
      month,
      count: items.length,
      total: sumAmounts(items),
      isCurrent: year === currentYear && month === currentMonth,
    }));
}

/**
 * Groups expenses of one month by category, sorted descending by total.
 * Expenses with null/empty category land in an "Uncategorized" pseudo-folder
 * that is returned ONLY when at least one expense is uncategorized.
 */
export function groupExpensesByCategory(
  expenses: Expense[],
  year: number,
  month: number,
  categoriesMeta: ExpenseCategory[]
): CategoryFolder[] {
  const catMap = new Map<string, Expense[]>();
  for (const e of expenses) {
    const parts = parseDateParts(e.expense_date);
    if (!parts || parts.year !== year || parts.month !== month) continue;
    const key = e.category && e.category.trim().length > 0 ? e.category : UNCATEGORIZED_KEY;
    const existing = catMap.get(key) ?? [];
    existing.push(e);
    catMap.set(key, existing);
  }

  const metaByName = new Map(categoriesMeta.map((c) => [c.name, c]));

  const folders: CategoryFolder[] = Array.from(catMap.entries()).map(([catKey, items]) => {
    const isUncat = catKey === UNCATEGORIZED_KEY;
    const meta = isUncat ? null : metaByName.get(catKey) ?? null;
    return {
      key: `${year}-${String(month).padStart(2, "0")}-${catKey}`,
      label: isUncat ? UNCATEGORIZED_LABEL : catKey,
      categoryName: catKey,
      icon: meta?.icon ?? null,
      color: meta?.color ?? null,
      count: items.length,
      total: sumAmounts(items),
      isUncategorized: isUncat,
    };
  });

  folders.sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, "de-CH"));
  return folders;
}

/**
 * Returns expenses filtered to one specific year/month/category scope.
 * For UNCATEGORIZED_KEY category, returns expenses with null/empty category.
 */
export function filterExpensesToLeaf(
  expenses: Expense[],
  year: number,
  month: number,
  category: string
): Expense[] {
  return expenses.filter((e) => {
    const parts = parseDateParts(e.expense_date);
    if (!parts) return false;
    if (parts.year !== year || parts.month !== month) return false;
    if (category === UNCATEGORIZED_KEY) {
      return !e.category || e.category.trim().length === 0;
    }
    return e.category === category;
  });
}

function sumAmounts(items: Expense[]): number {
  const cents = items.reduce((s, e) => s + Math.round(Number(e.amount) * 100), 0);
  return cents / 100;
}
