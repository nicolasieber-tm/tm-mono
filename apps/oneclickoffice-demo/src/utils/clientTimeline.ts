import { formatDateDE } from "@/components/expenses/formatters";

export type TimelineEventType = "note" | "invoice" | "time" | "expense";

export interface TimelineEvent {
  id: string; // eindeutig über Typen: `${type}:${recordId}`
  type: TimelineEventType;
  date: string; // ISO-String, Basis der Sortierung
  title: string;
  subtitle?: string;
  amount?: number | null; // nur invoice/expense
  status?: string | null; // nur invoice/expense
}

export interface TimelineNoteInput {
  id: string;
  content: string;
  session_date: string | null;
  created_at: string;
}

export interface TimelineInvoiceInput {
  id: string;
  invoice_number: string;
  total: number;
  status: string;
  created_at: string;
  period_start: string;
  period_end: string;
}

export interface TimelineTimeInput {
  id: string;
  date: string;
  total_hours: number;
  activity_description: string | null;
  category: string | null;
}

export interface TimelineExpenseInput {
  id: string;
  amount: number;
  status: string;
  expense_date: string;
  category: string | null;
  notes: string | null;
}

const TYPE_ORDER: Record<TimelineEventType, number> = {
  note: 0,
  time: 1,
  invoice: 2,
  expense: 3,
};

// Inhalt → einzeiliger Auszug, max `max` Zeichen (+ Ellipse).
function excerpt(text: string, max = 120): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  return oneLine.length > max ? `${oneLine.slice(0, max)}…` : oneLine;
}

export function mapNotes(notes: TimelineNoteInput[]): TimelineEvent[] {
  return notes.map((n) => ({
    id: `note:${n.id}`,
    type: "note" as const,
    date: n.session_date ?? n.created_at,
    title: "Sitzungsnotiz",
    subtitle: excerpt(n.content) || undefined,
  }));
}

export function mapInvoices(invoices: TimelineInvoiceInput[]): TimelineEvent[] {
  return invoices.map((i) => ({
    id: `invoice:${i.id}`,
    type: "invoice" as const,
    date: i.created_at,
    title: `Rechnung ${i.invoice_number}`,
    subtitle: `Zeitraum ${formatDateDE(i.period_start)} – ${formatDateDE(i.period_end)}`,
    amount: Number(i.total) || 0,
    status: i.status,
  }));
}

export function mapTimeEntries(entries: TimelineTimeInput[]): TimelineEvent[] {
  return entries.map((t) => ({
    id: `time:${t.id}`,
    type: "time" as const,
    date: t.date,
    title: `Zeiterfassung ${t.total_hours} Std.`,
    subtitle: t.activity_description?.trim() || t.category?.trim() || undefined,
  }));
}

export function mapExpenses(expenses: TimelineExpenseInput[]): TimelineEvent[] {
  return expenses.map((e) => ({
    id: `expense:${e.id}`,
    type: "expense" as const,
    date: e.expense_date,
    title: e.category?.trim() ? `Spese ${e.category.trim()}` : "Spese",
    subtitle: e.notes?.trim() || undefined,
    amount: Number(e.amount) || 0,
    status: e.status,
  }));
}

export function mergeTimeline(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate !== 0) return byDate;
    const byType = TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
    if (byType !== 0) return byType;
    return a.id.localeCompare(b.id);
  });
}
