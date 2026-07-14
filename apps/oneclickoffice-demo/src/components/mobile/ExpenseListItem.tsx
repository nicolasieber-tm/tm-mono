import { Receipt, ChevronRight, Check, Loader2, AlertTriangle } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

export type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"] & {
  kunden?: { name: string } | null;
};

interface Props {
  expense: ExpenseRow;
  onClick?: () => void;
}

const statusMeta = (status: string) => {
  switch (status) {
    case "completed":
      return { label: "Erkannt", cls: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300", Icon: Check };
    case "processing":
      return { label: "Wird analysiert", cls: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300", Icon: Loader2 };
    case "failed":
      return { label: "Fehler", cls: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300", Icon: AlertTriangle };
    default:
      return { label: status, cls: "bg-muted text-muted-foreground", Icon: Receipt };
  }
};

const ExpenseListItem = ({ expense, onClick }: Props) => {
  const meta = statusMeta(expense.status);
  const StatusIcon = meta.Icon;
  const title =
    expense.notes?.trim() ||
    (expense.status === "completed" ? expense.category : "Beleg wird verarbeitet …");

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50 active:scale-[0.99]"
    >
      <div className="h-11 w-11 rounded-xl bg-muted text-muted-foreground flex items-center justify-center flex-none overflow-hidden">
        {expense.receipt_image_url ? (
          <img src={expense.receipt_image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <Receipt className="h-5 w-5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-foreground truncate">{title}</div>
        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold flex-none ${meta.cls}`}>
            <StatusIcon className={`h-3 w-3 ${expense.status === "processing" ? "animate-spin" : ""}`} />
            {meta.label}
          </span>
          {expense.status === "completed" && <span className="truncate">{expense.category}</span>}
        </div>
      </div>
      <div className="font-bold tabular-nums text-foreground flex-none">
        {expense.amount > 0 ? (
          <>
            {expense.amount.toFixed(2)}
            <span className="text-xs font-medium text-muted-foreground"> CHF</span>
          </>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
      {onClick && <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-none" />}
    </button>
  );
};

export default ExpenseListItem;
