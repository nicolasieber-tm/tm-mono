import type { Expense, NavigationPath } from "./types";
import { groupExpensesByMonth } from "./groupingHelpers";
import { FolderCard } from "./FolderCard";

type Props = {
  expenses: Expense[];
  year: number;
  onNavigate: (path: NavigationPath) => void;
  onDownloadMonth: (year: number, month: number) => void;
};

export function MonthFolderGrid({ expenses, year, onNavigate, onDownloadMonth }: Props) {
  const now = new Date();
  const months = groupExpensesByMonth(expenses, year, now.getFullYear(), now.getMonth() + 1);

  if (months.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
        Keine Spesen in {year}.
      </div>
    );
  }

  return (
    <div>
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3.5">
        Nach Monat · Chronologisch →
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
        {months.map((m) => (
          <FolderCard
            key={m.key}
            variant="month"
            title={m.label}
            subtitle={String(m.month).padStart(2, "0")}
            count={m.count}
            total={m.total}
            isCurrent={m.isCurrent}
            onClick={() => onNavigate({ year: m.year, month: m.month, category: null })}
            onDownload={() => onDownloadMonth(m.year, m.month)}
          />
        ))}
      </div>
    </div>
  );
}
