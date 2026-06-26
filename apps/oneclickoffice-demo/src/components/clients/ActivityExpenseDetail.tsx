import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Download, Loader2 } from "lucide-react";
import { useExpense, useUpdateExpense, useDeleteExpense } from "@/hooks/useExpenses";
import { formatCHF, formatDateDE } from "@/components/expenses/formatters";

interface Props {
  id: string;
  onClose: () => void;
}

export const ActivityExpenseDetail = ({ id, onClose }: Props) => {
  const queryClient = useQueryClient();
  const { data: expense, isLoading, error } = useExpense(id);
  const update = useUpdateExpense();
  const del = useDeleteExpense();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [form, setForm] = useState({ expense_date: "", amount: "", category: "", notes: "" });

  const startEdit = () => {
    if (!expense) return;
    setForm({
      expense_date: expense.expense_date ?? "",
      amount: String(expense.amount ?? ""),
      category: expense.category ?? "",
      notes: expense.notes ?? "",
    });
    setIsEditing(true);
  };

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["client-timeline"] });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense) return;
    await update.mutateAsync({
      id: expense.id,
      updates: {
        expense_date: form.expense_date,
        amount: Number(form.amount) || 0,
        category: form.category.trim(),
        notes: form.notes.trim() || null,
      },
    });
    refresh();
    setIsEditing(false);
  };

  return (
    <>
      <DialogContent className="max-w-[860px] w-[95vw] p-0 overflow-hidden grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-0 max-h-[90vh]">
        <DialogTitle className="sr-only">{expense?.notes?.trim() || "Beleg"}</DialogTitle>
        <DialogDescription className="sr-only">Spesen-Detail</DialogDescription>

        {/* Bild-Spalte */}
        <div className="relative flex items-center justify-center bg-slate-50 p-8">
          {expense?.receipt_image_url ? (
            <img
              src={expense.receipt_image_url}
              alt="Beleg"
              className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-xl"
            />
          ) : (
            <div className="rounded-lg bg-white p-12 text-6xl text-slate-400 shadow-xl">🧾</div>
          )}
        </div>

        {/* Detail-Spalte */}
        <div className="flex min-w-0 flex-col overflow-y-auto p-6">
          {isLoading && (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
          {error && !isLoading && (
            <p className="py-8 text-center text-sm text-destructive">
              Spese konnte nicht geladen werden.
            </p>
          )}

          {expense && !isLoading && !isEditing && (
            <>
              <div className="text-3xl font-extrabold tracking-tight text-foreground">
                CHF {formatCHF(Number(expense.amount) || 0)}
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Datum</dt>
                  <dd className="font-medium">{formatDateDE(expense.expense_date)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Kategorie</dt>
                  <dd className="font-medium">{expense.category || "—"}</dd>
                </div>
              </dl>
              {expense.notes && (
                <div className="mt-4">
                  <div className="text-xs text-muted-foreground">Notizen</div>
                  <div className="mt-1 rounded-md bg-muted/50 p-3 text-sm">{expense.notes}</div>
                </div>
              )}
              <div className="mt-auto flex gap-2 border-t pt-4">
                <Button variant="secondary" size="sm" className="flex-1" onClick={startEdit}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Bearbeiten
                </Button>
                {expense.receipt_image_url && (
                  <Button variant="secondary" size="sm" asChild>
                    <a href={expense.receipt_image_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </>
          )}

          {expense && !isLoading && isEditing && (
            <form onSubmit={handleSave} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="exp-date">Datum</Label>
                <Input
                  id="exp-date"
                  type="date"
                  value={form.expense_date}
                  onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exp-amount">Betrag (CHF)</Label>
                <Input
                  id="exp-amount"
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exp-category">Kategorie</Label>
                <Input
                  id="exp-category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exp-notes">Notizen</Label>
                <Textarea
                  id="exp-notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} disabled={update.isPending}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={update.isPending}>
                  {update.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Speichern…
                    </>
                  ) : (
                    "Speichern"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Spese löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Spese wird dauerhaft gelöscht. Möchten Sie wirklich fortfahren?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                if (!expense) return;
                await del.mutateAsync(expense.id);
                setIsDeleteOpen(false);
                refresh();
                onClose();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={del.isPending}
            >
              {del.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gelöscht…
                </>
              ) : (
                "Löschen"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
