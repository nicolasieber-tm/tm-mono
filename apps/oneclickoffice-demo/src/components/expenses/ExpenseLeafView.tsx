import type { Expense, ExpenseCategory, LeafStyle } from "./types";
import { filterExpensesToLeaf } from "./groupingHelpers";
import { ExpenseSummaryCard } from "./ExpenseSummaryCard";
import { ExpensePhotoTile } from "./ExpensePhotoTile";

type Props = {
  expenses: Expense[];
  year: number;
  month: number;
  category: string;
  categoryMeta: ExpenseCategory | null;
  leafStyle: LeafStyle;
  onExpenseClick: (expense: Expense) => void;
};

export function ExpenseLeafView({
  expenses,
  year,
  month,
  category,
  categoryMeta,
  leafStyle,
  onExpenseClick,
}: Props) {
  const items = filterExpensesToLeaf(expenses, year, month, category);
  // sort newest first
  items.sort((a, b) => (b.expense_date ?? "").localeCompare(a.expense_date ?? ""));

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
        Keine Belege in diesem Bereich.
      </div>
    );
  }

  if (leafStyle === "gallery") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
        {items.map((e) => (
          <ExpensePhotoTile
            key={e.id}
            expense={e}
            categoryColor={categoryMeta?.color ?? null}
            onClick={() => onExpenseClick(e)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
      {items.map((e) => (
        <ExpenseSummaryCard
          key={e.id}
          expense={e}
          categoryColor={categoryMeta?.color ?? null}
          onClick={() => onExpenseClick(e)}
        />
      ))}
    </div>
  );
}
