import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { useUpdateExpense, useDeleteExpense } from "@/hooks/useExpenses";
import { useExpenseCategories } from "@/hooks/useExpenseCategories";
import { ExpenseRow } from "@/components/mobile/ExpenseListItem";

interface Props {
  expense: ExpenseRow | null;
  onOpenChange: (open: boolean) => void;
}

const MobileExpenseSheet = ({ expense, onOpenChange }: Props) => {
  const { data: categories } = useExpenseCategories();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!expense) return;
    setAmount(expense.amount != null ? String(expense.amount) : "");
    setCategory(expense.category ?? "");
    setExpenseDate(expense.expense_date ?? "");
    setNotes(expense.notes ?? "");
  }, [expense]);

  const busy = updateExpense.isPending || deleteExpense.isPending;

  const handleSave = async () => {
    if (!expense) return;
    const parsed = parseFloat(amount.replace(",", "."));
    if (isNaN(parsed) || parsed < 0) {
      toast.error("Bitte einen gültigen Betrag angeben");
      return;
    }
    if (!category) {
      toast.error("Bitte eine Kategorie wählen");
      return;
    }
    try {
      await updateExpense.mutateAsync({
        id: expense.id,
        updates: {
          amount: parsed,
          category,
          expense_date: expenseDate,
          notes: notes || null,
        },
      });
      onOpenChange(false);
    } catch {
      // Hook zeigt eigenen Error-Toast
    }
  };

  const handleDelete = async () => {
    if (!expense) return;
    try {
      await deleteExpense.mutateAsync(expense.id);
      onOpenChange(false);
    } catch {
      // Hook zeigt eigenen Error-Toast
    }
  };

  return (
    <Drawer open={!!expense} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="text-left">
            <DrawerTitle>Spese bearbeiten</DrawerTitle>
            <DrawerDescription>KI-Erkennung prüfen und korrigieren</DrawerDescription>
          </DrawerHeader>

          <div className="px-4 space-y-4 pb-2">
            {expense?.receipt_image_url && (
              <img
                src={expense.receipt_image_url}
                alt="Beleg"
                className="w-full max-h-44 object-contain rounded-xl border border-border bg-muted"
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="exp-amount" className="text-sm font-semibold">Betrag (CHF)</Label>
                <Input
                  id="exp-amount"
                  type="number"
                  inputMode="decimal"
                  step="0.05"
                  className="h-12 text-center font-semibold tabular-nums"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exp-date" className="text-sm font-semibold">Datum</Label>
                <Input
                  id="exp-date"
                  type="date"
                  className="h-12 text-center font-semibold"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Kategorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp-notes" className="text-sm font-semibold">Notiz</Label>
              <Textarea
                id="exp-notes"
                rows={2}
                className="resize-none"
                placeholder="Optionale Notiz …"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DrawerFooter className="flex-row gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="h-12 text-destructive hover:text-destructive" disabled={busy}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Spese löschen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Diese Spese und der zugehörige Beleg-Eintrag werden dauerhaft entfernt.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button className="flex-1 h-12 text-base font-bold" onClick={handleSave} disabled={busy}>
              {updateExpense.isPending ? (
                <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Speichern …</>
              ) : (
                <><Check className="h-5 w-5 mr-2" />Speichern</>
              )}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileExpenseSheet;
