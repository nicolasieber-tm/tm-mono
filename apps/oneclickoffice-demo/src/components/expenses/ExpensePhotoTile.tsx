import type { Expense } from "./types";
import { ExpenseBadges } from "./ExpenseBadges";
import { formatCHF, formatDateDE } from "./formatters";

type Props = {
  expense: Expense;
  categoryColor?: string | null;
  onClick: () => void;
};

export function ExpensePhotoTile({ expense, categoryColor, onClick }: Props) {
  const bg = categoryColor
    ? `linear-gradient(135deg, ${categoryColor}33 0%, ${categoryColor}11 100%)`
    : "linear-gradient(135deg, #e2e8f0 0%, #f1f5f9 100%)";

  return (
    <div
      onClick={onClick}
      className="group relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-[1.01]"
      style={{ background: bg }}
    >
      {expense.receipt_image_url ? (
        <img
          src={expense.receipt_image_url}
          alt={expense.notes ?? "Beleg"}
          className="w-full h-full object-contain p-4"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400 text-5xl">
          🧾
        </div>
      )}

      <ExpenseBadges expense={expense} className="absolute top-2.5 left-2.5" />

      <div
        className="absolute bottom-0 left-0 right-0 px-3.5 pt-8 pb-3 flex justify-between items-end"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)",
        }}
      >
        <div className="text-[11px] font-medium text-white/90">
          {formatDateDE(expense.expense_date)}
        </div>
        <div className="text-[16px] font-extrabold text-white">
          CHF {formatCHF(Number(expense.amount ?? 0))}
        </div>
      </div>
    </div>
  );
}
