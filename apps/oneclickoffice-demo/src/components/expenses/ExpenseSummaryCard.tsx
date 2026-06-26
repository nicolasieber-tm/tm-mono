import type { Expense } from "./types";
import { ExpenseBadges } from "./ExpenseBadges";
import { formatCHF, formatDateDE } from "./formatters";
import { cn } from "@/lib/utils";

type Props = {
  expense: Expense;
  categoryColor?: string | null;
  onClick: () => void;
};

export function ExpenseSummaryCard({ expense, categoryColor, onClick }: Props) {
  const thumbBg = categoryColor
    ? `linear-gradient(135deg, ${categoryColor}22 0%, ${categoryColor}0a 100%)`
    : "linear-gradient(135deg, #f1f5f9 0%, #f8fafc 100%)";

  const title = expense.notes?.trim() || "Beleg";

  return (
    <div
      onClick={onClick}
      className={cn(
        "group bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer shadow-sm transition-all",
        "hover:-translate-y-0.5 hover:shadow-lg"
      )}
    >
      <div
        className="relative aspect-[4/3] flex items-center justify-center"
        style={{ background: thumbBg }}
      >
        {expense.receipt_image_url ? (
          <img
            src={expense.receipt_image_url}
            alt={title}
            className="max-h-full max-w-full object-contain p-3"
            loading="lazy"
          />
        ) : (
          <div className="text-slate-400 text-4xl">🧾</div>
        )}
        <ExpenseBadges expense={expense} className="absolute top-2 left-2" />
      </div>
      <div className="p-3.5">
        <div className="text-[13px] font-bold text-slate-900 truncate">{title}</div>
        <div className="flex justify-between items-center mt-1.5">
          <div className="text-[11px] text-slate-500">{formatDateDE(expense.expense_date)}</div>
          <div className="text-[15px] font-extrabold text-slate-900">
            CHF {formatCHF(Number(expense.amount ?? 0))}
          </div>
        </div>
      </div>
    </div>
  );
}
