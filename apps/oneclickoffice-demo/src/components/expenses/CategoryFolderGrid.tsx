import type { Expense, NavigationPath, ExpenseCategory } from "./types";
import { groupExpensesByCategory } from "./groupingHelpers";
import { FolderCard } from "./FolderCard";

type Props = {
  expenses: Expense[];
  year: number;
  month: number;
  categoriesMeta: ExpenseCategory[];
  onNavigate: (path: NavigationPath) => void;
};

export function CategoryFolderGrid({
  expenses,
  year,
  month,
  categoriesMeta,
  onNavigate,
}: Props) {
  const categories = groupExpensesByCategory(expenses, year, month, categoriesMeta);

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
        Keine Spesen in diesem Monat.
      </div>
    );
  }

  return (
    <div>
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3.5">
        Nach Kategorie
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
        {categories.map((c) => (
          <FolderCard
            key={c.key}
            variant="category"
            title={c.label}
            count={c.count}
            total={c.total}
            iconEmoji={c.icon ?? "📁"}
            iconColor={c.color ?? "#64748b"}
            isUncategorized={c.isUncategorized}
            onClick={() =>
              onNavigate({ year, month, category: c.categoryName })
            }
          />
        ))}
      </div>
    </div>
  );
}
