import type { Expense, ExpenseCategory, NavigationPath } from "./types";
import {
  filterExpensesByScope,
  scopeLabel,
  scopeFilename,
  buildCSV,
  triggerCsvDownload,
} from "./csvExport";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { monthName } from "./formatters";

type Props = {
  expenses: Expense[];
  path: NavigationPath;
  categoriesMeta: ExpenseCategory[];
};

export function CsvExportButton({ expenses, path, categoriesMeta }: Props) {
  const items = filterExpensesByScope(expenses, path);

  const fullLabel =
    path.year == null
      ? "Alle CSV"
      : path.month == null
      ? `Jahr ${path.year} CSV`
      : path.category == null
      ? `${monthName(path.month)} CSV`
      : `${path.category} CSV`;

  const handleClick = () => {
    if (items.length === 0) {
      toast.error("Keine Belege in diesem Bereich");
      return;
    }
    const csv = buildCSV(items, categoriesMeta);
    triggerCsvDownload(csv, scopeFilename(path));
    toast.success(`✓ ${items.length} Belege heruntergeladen`, {
      description: scopeLabel(path),
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className="gap-1.5 whitespace-nowrap"
      title={`${fullLabel} · ${items.length} Belege`}
    >
      <Download className="h-4 w-4 shrink-0" />
      <span className="hidden md:inline">{fullLabel}</span>
      <span className="md:hidden">CSV</span>
      <span className="text-slate-400 font-medium">({items.length})</span>
    </Button>
  );
}
