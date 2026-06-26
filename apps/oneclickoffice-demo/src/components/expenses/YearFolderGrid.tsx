import type { Expense, NavigationPath } from "./types";
import { groupExpensesByYear } from "./groupingHelpers";
import { FolderCard } from "./FolderCard";

type Props = {
  expenses: Expense[];
  onNavigate: (path: NavigationPath) => void;
  onDownloadYear: (year: number) => void;
};

export function YearFolderGrid({ expenses, onNavigate, onDownloadYear }: Props) {
  const currentYear = new Date().getFullYear();
  const years = groupExpensesByYear(expenses, currentYear);

  if (years.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
        Keine Spesen erfasst.
      </div>
    );
  }

  return (
    <div>
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3.5">
        Nach Jahr · Chronologisch →
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {years.map((y) => (
          <FolderCard
            key={y.key}
            variant="year"
            title={y.label}
            count={y.count}
            total={y.total}
            isCurrent={y.isCurrent}
            onClick={() => onNavigate({ year: y.year, month: null, category: null })}
            onDownload={() => onDownloadYear(y.year)}
          />
        ))}
      </div>
    </div>
  );
}
