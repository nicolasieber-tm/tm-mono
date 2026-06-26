import type { Expense, ExpenseCategory } from "./types";
import { ExpenseBadges } from "./ExpenseBadges";
import { formatCHF, formatDateDE } from "./formatters";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Download, Trash2, AlertTriangle, Loader2 } from "lucide-react";

type Props = {
  expense: Expense | null;
  categoryMeta: ExpenseCategory | null;
  onClose: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onRetryAI: (expense: Expense) => void;
};

export function ExpenseDetailLightbox({
  expense,
  categoryMeta,
  onClose,
  onEdit,
  onDelete,
  onRetryAI,
}: Props) {
  const open = expense !== null;
  const title = expense?.notes?.trim() || "Beleg";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-[900px] w-[95vw] p-0 overflow-hidden grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-0 max-h-[90vh] rounded-2xl sm:rounded-2xl"
      >
        {expense && (
          <>
            <DialogTitle className="sr-only">{title}</DialogTitle>
            <DialogDescription className="sr-only">
              Beleg-Details · CHF {formatCHF(Number(expense.amount ?? 0))} · {formatDateDE(expense.expense_date)}
            </DialogDescription>

            <div
              className="relative flex items-center justify-center p-10"
              style={{
                background: categoryMeta?.color
                  ? `linear-gradient(135deg, ${categoryMeta.color}22 0%, ${categoryMeta.color}08 100%)`
                  : "#f8fafc",
              }}
            >
              {expense.receipt_image_url ? (
                <img
                  src={expense.receipt_image_url}
                  alt="Beleg"
                  className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-xl"
                />
              ) : (
                <div className="bg-white rounded-lg p-12 shadow-xl text-slate-400 text-6xl">
                  🧾
                </div>
              )}
            </div>

            <div className="p-6 overflow-y-auto flex flex-col min-w-0">
              <div>
                <h2 className="text-[22px] font-bold tracking-tight text-slate-900">
                  {title}
                </h2>
                {categoryMeta && (
                  <div className="mt-1 mb-5">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: `${categoryMeta.color ?? "#64748b"}22`,
                        color: categoryMeta.color ?? "#64748b",
                      }}
                    >
                      {categoryMeta.icon ?? "📁"} {categoryMeta.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-[36px] font-extrabold tracking-tighter text-slate-900 leading-none">
                CHF {formatCHF(Number(expense.amount ?? 0))}
              </div>

              <div className="mt-4 mb-6">
                <ExpenseBadges expense={expense} size="md" />
              </div>

              {expense.status === "failed" && (
                <div className="flex gap-2.5 items-start p-3.5 mb-5 rounded-[10px] bg-red-50 border border-red-200">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-[13px] font-bold text-red-700">
                      KI-Auslesung fehlgeschlagen
                    </div>
                    <div className="text-[11px] text-red-900/70 mt-0.5">
                      Der Beleg konnte nicht automatisch ausgelesen werden.
                      Du kannst die Daten manuell erfassen oder es nochmal probieren.
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="mt-2"
                      onClick={() => onRetryAI(expense)}
                    >
                      Nochmal analysieren
                    </Button>
                  </div>
                </div>
              )}

              {expense.status === "processing" && (
                <div className="flex gap-2.5 items-center p-3.5 mb-5 rounded-[10px] bg-amber-50 border border-amber-200">
                  <Loader2 className="h-5 w-5 text-amber-700 animate-spin shrink-0" />
                  <div className="text-[12px] text-amber-900">
                    Der Beleg wird gerade von der KI analysiert…
                  </div>
                </div>
              )}

              <dl className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Datum
                  </dt>
                  <dd className="text-[14px] font-semibold text-slate-900">
                    {formatDateDE(expense.expense_date)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Mitarbeiter
                  </dt>
                  <dd className="text-[14px] font-semibold text-slate-900 truncate">
                    {[expense.employees?.first_name, expense.employees?.last_name]
                      .filter(Boolean)
                      .join(" ") || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Firma
                  </dt>
                  <dd className="text-[14px] font-semibold text-slate-900 truncate">
                    {expense.kunden?.name ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Beleg-ID
                  </dt>
                  <dd className="text-[14px] font-semibold text-slate-900 font-mono">
                    #{expense.id.slice(0, 8)}
                  </dd>
                </div>
              </dl>

              {expense.notes && (
                <div className="mb-6">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Notizen
                  </div>
                  <div className="bg-slate-50 rounded-[10px] p-3.5 text-[13px] text-slate-600">
                    {expense.notes}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 min-w-0 px-2"
                  onClick={() => onEdit(expense)}
                >
                  <Pencil className="h-3.5 w-3.5 shrink-0" />
                  <span className="ml-1.5 truncate">Bearbeiten</span>
                </Button>
                {expense.receipt_image_url && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 min-w-0 px-2"
                    asChild
                  >
                    <a
                      href={expense.receipt_image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-3.5 w-3.5 shrink-0" />
                      <span className="ml-1.5 truncate">Download</span>
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 min-w-0 px-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => onDelete(expense)}
                >
                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="ml-1.5 truncate">Löschen</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
