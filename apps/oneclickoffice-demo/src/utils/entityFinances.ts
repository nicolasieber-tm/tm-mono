export type FinanceRangePreset =
  | "today"
  | "week"
  | "month"
  | "year"
  | "all"
  | "custom";

export interface DateRange {
  /** Inclusive lower bound, ISO YYYY-MM-DD, or null for open. */
  from: string | null;
  /** Inclusive upper bound, ISO YYYY-MM-DD, or null for open. */
  to: string | null;
}

export interface FinanceInvoice {
  id: string;
  invoice_number: string;
  total: number;
  status: string; // draft | sent | paid
  period_end: string; // ISO
}

export interface FinanceExpense {
  id: string;
  amount: number;
  status: string; // processing | completed | failed | …
  expense_date: string; // ISO
  category: string | null;
  notes: string | null;
}

export interface MoneyGroup {
  count: number;
  sum: number;
}

export interface FinanceMovement {
  id: string;
  type: "income" | "expense";
  date: string; // ISO
  label: string;
  amount: number; // always positive; sign implied by type
  status?: string;
}

export interface FinanceSummary {
  einnahmenBezahlt: MoneyGroup;
  einnahmenOffen: MoneyGroup;
  entwuerfe: MoneyGroup;
  ausgaben: MoneyGroup;
  einnahmenGesamt: number;
  saldo: number;
  bewegungen: FinanceMovement[];
}

/** Spesen mit diesen Status zählen nicht als finalisierte Ausgabe. */
const NON_FINAL_EXPENSE_STATUS = new Set(["processing", "failed"]);

const toISODate = (d: Date): string => d.toISOString().slice(0, 10);

export function computeRange(
  preset: FinanceRangePreset,
  nowISO: string,
): DateRange {
  const today = nowISO.slice(0, 10);
  if (preset === "all" || preset === "custom") {
    return { from: null, to: null };
  }
  if (preset === "today") {
    return { from: today, to: today };
  }
  const base = new Date(`${today}T00:00:00.000Z`);
  if (preset === "week") {
    const day = base.getUTCDay(); // 0=Sun..6=Sat
    const diffToMonday = (day + 6) % 7; // Mon=0
    const monday = new Date(base);
    monday.setUTCDate(base.getUTCDate() - diffToMonday);
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    return { from: toISODate(monday), to: toISODate(sunday) };
  }
  if (preset === "month") {
    const y = base.getUTCFullYear();
    const m = base.getUTCMonth(); // 0-based
    const first = new Date(Date.UTC(y, m, 1));
    const last = new Date(Date.UTC(y, m + 1, 0));
    return { from: toISODate(first), to: toISODate(last) };
  }
  // year
  const y = base.getUTCFullYear();
  return { from: `${y}-01-01`, to: `${y}-12-31` };
}

export function isWithinRange(dateISO: string, range: DateRange): boolean {
  const d = (dateISO || "").slice(0, 10);
  if (!d) return false;
  if (range.from && d < range.from) return false;
  if (range.to && d > range.to) return false;
  return true;
}

const emptyGroup = (): MoneyGroup => ({ count: 0, sum: 0 });

const expenseLabel = (e: FinanceExpense): string => {
  const cat = e.category?.trim();
  if (cat) return cat;
  const note = e.notes?.trim();
  if (note) return note.length > 40 ? `${note.slice(0, 40)}…` : note;
  return "Ausgabe";
};

export function aggregateFinances(
  invoices: FinanceInvoice[],
  expenses: FinanceExpense[],
  range: DateRange,
  movementLimit = 8,
): FinanceSummary {
  const inRangeInvoices = invoices.filter((i) =>
    isWithinRange(i.period_end, range),
  );
  const inRangeExpenses = expenses.filter((e) =>
    isWithinRange(e.expense_date, range),
  );

  const einnahmenBezahlt = emptyGroup();
  const einnahmenOffen = emptyGroup();
  const entwuerfe = emptyGroup();

  for (const i of inRangeInvoices) {
    const total = Number(i.total) || 0;
    if (i.status === "paid") {
      einnahmenBezahlt.count++;
      einnahmenBezahlt.sum += total;
    } else if (i.status === "sent") {
      einnahmenOffen.count++;
      einnahmenOffen.sum += total;
    } else if (i.status === "draft") {
      entwuerfe.count++;
      entwuerfe.sum += total;
    }
  }

  const finalisierteSpesen = inRangeExpenses.filter(
    (e) => !NON_FINAL_EXPENSE_STATUS.has(e.status),
  );
  const ausgaben: MoneyGroup = {
    count: finalisierteSpesen.length,
    sum: finalisierteSpesen.reduce((acc, e) => acc + (Number(e.amount) || 0), 0),
  };

  const einnahmenGesamt = einnahmenBezahlt.sum + einnahmenOffen.sum;
  const saldo = einnahmenGesamt - ausgaben.sum;

  const incomeMovements: FinanceMovement[] = inRangeInvoices
    .filter((i) => i.status === "paid" || i.status === "sent")
    .map((i) => ({
      id: i.id,
      type: "income" as const,
      date: i.period_end,
      label: `Rechnung ${i.invoice_number}`,
      amount: Number(i.total) || 0,
      status: i.status,
    }));
  const expenseMovements: FinanceMovement[] = finalisierteSpesen.map((e) => ({
    id: e.id,
    type: "expense" as const,
    date: e.expense_date,
    label: expenseLabel(e),
    amount: Number(e.amount) || 0,
    status: e.status,
  }));

  const bewegungen = [...incomeMovements, ...expenseMovements]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, movementLimit);

  return {
    einnahmenBezahlt,
    einnahmenOffen,
    entwuerfe,
    ausgaben,
    einnahmenGesamt,
    saldo,
    bewegungen,
  };
}
