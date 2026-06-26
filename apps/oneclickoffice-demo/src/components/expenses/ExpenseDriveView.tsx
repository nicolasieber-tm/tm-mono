import { useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { Expense, ExpenseCategory, NavigationPath } from "./types";
import { UNCATEGORIZED_KEY } from "./types";
import { ExpenseBreadcrumb } from "./ExpenseBreadcrumb";
import { YearFolderGrid } from "./YearFolderGrid";
import { MonthFolderGrid } from "./MonthFolderGrid";
import { CategoryFolderGrid } from "./CategoryFolderGrid";
import { ExpenseLeafView } from "./ExpenseLeafView";
import { ExpenseDetailLightbox } from "./ExpenseDetailLightbox";
import { CsvExportButton } from "./CsvExportButton";
import {
  filterExpensesByScope,
  buildCSV,
  scopeFilename,
  triggerCsvDownload,
} from "./csvExport";
import { toast } from "sonner";
import { useExpenseViewPreference } from "@/hooks/useExpenseViewPreference";

type Props = {
  expenses: Expense[];
  categoriesMeta: ExpenseCategory[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onRetryAI: (expense: Expense) => void;
};

export function ExpenseDriveView({
  expenses,
  categoriesMeta,
  onEdit,
  onDelete,
  onRetryAI,
}: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: leafStyle = "summary" } = useExpenseViewPreference();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const path: NavigationPath = useMemo(
    () => ({
      year: parseOrNull(searchParams.get("year")),
      month: parseOrNull(searchParams.get("month")),
      category: searchParams.get("category"),
    }),
    [searchParams]
  );

  const navigate = useCallback(
    (next: NavigationPath) => {
      const params = new URLSearchParams(searchParams);
      if (next.year == null) params.delete("year");
      else params.set("year", String(next.year));
      if (next.month == null) params.delete("month");
      else params.set("month", String(next.month));
      if (next.category == null) params.delete("category");
      else params.set("category", next.category);
      setSearchParams(params, { replace: false });
    },
    [searchParams, setSearchParams]
  );

  const categoryMeta = useMemo(() => {
    if (path.category == null || path.category === UNCATEGORIZED_KEY) return null;
    return categoriesMeta.find((c) => c.name === path.category) ?? null;
  }, [categoriesMeta, path.category]);

  const handleDownloadScope = (scope: NavigationPath) => {
    const items = filterExpensesByScope(expenses, scope);
    if (items.length === 0) {
      toast.error("Keine Belege in diesem Bereich");
      return;
    }
    const csv = buildCSV(items, categoriesMeta);
    triggerCsvDownload(csv, scopeFilename(scope));
    toast.success(`✓ ${items.length} Belege heruntergeladen`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-slate-100 bg-white">
        <div className="flex-1 min-w-0">
          <ExpenseBreadcrumb
            path={path}
            onNavigate={navigate}
            categoryIcon={categoryMeta?.icon ?? null}
            categoryLabel={
              path.category === UNCATEGORIZED_KEY ? "Nicht kategorisiert" : categoryMeta?.name ?? null
            }
          />
        </div>
        <div className="shrink-0">
          <CsvExportButton
            expenses={expenses}
            path={path}
            categoriesMeta={categoriesMeta}
          />
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-7 bg-slate-50 min-h-[500px]">
        {path.year == null && (
          <YearFolderGrid
            expenses={expenses}
            onNavigate={navigate}
            onDownloadYear={(year) => handleDownloadScope({ year, month: null, category: null })}
          />
        )}
        {path.year != null && path.month == null && (
          <MonthFolderGrid
            expenses={expenses}
            year={path.year}
            onNavigate={navigate}
            onDownloadMonth={(year, month) =>
              handleDownloadScope({ year, month, category: null })
            }
          />
        )}
        {path.year != null && path.month != null && path.category == null && (
          <CategoryFolderGrid
            expenses={expenses}
            year={path.year}
            month={path.month}
            categoriesMeta={categoriesMeta}
            onNavigate={navigate}
          />
        )}
        {path.year != null && path.month != null && path.category != null && (
          <ExpenseLeafView
            expenses={expenses}
            year={path.year}
            month={path.month}
            category={path.category}
            categoryMeta={categoryMeta}
            leafStyle={leafStyle}
            onExpenseClick={(e) => setSelectedExpense(e)}
          />
        )}
      </div>

      <ExpenseDetailLightbox
        expense={selectedExpense}
        categoryMeta={categoryMeta}
        onClose={() => setSelectedExpense(null)}
        onEdit={(e) => {
          setSelectedExpense(null);
          onEdit(e);
        }}
        onDelete={(e) => {
          setSelectedExpense(null);
          onDelete(e);
        }}
        onRetryAI={(e) => {
          onRetryAI(e);
        }}
      />
    </div>
  );
}

function parseOrNull(v: string | null): number | null {
  if (v == null) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}
