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
import { Clock, Pencil, Trash2, Loader2 } from "lucide-react";
import { useTimeEntry, useUpdateTimeEntry, useDeleteTimeEntry } from "@/hooks/useTimeEntries";
import { deriveTimeEntryFields } from "@/utils/timeEntry";
import { formatDateDE } from "@/components/expenses/formatters";

interface Props {
  id: string;
  onClose: () => void;
}

export const ActivityTimeDetail = ({ id, onClose }: Props) => {
  const queryClient = useQueryClient();
  const { data: entry, isLoading, error } = useTimeEntry(id);
  const update = useUpdateTimeEntry();
  const del = useDeleteTimeEntry();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [form, setForm] = useState({
    date: "",
    total_hours: "",
    category: "",
    activity_description: "",
    travel_from: "",
    travel_to: "",
    travel_distance_km: "",
    travel_expense_amount: "",
  });

  const startEdit = () => {
    if (!entry) return;
    setForm({
      date: entry.date ?? "",
      total_hours: String(entry.total_hours ?? ""),
      category: entry.category ?? "",
      activity_description: entry.activity_description ?? "",
      travel_from: entry.travel_from ?? "",
      travel_to: entry.travel_to ?? "",
      travel_distance_km: entry.travel_distance_km != null ? String(entry.travel_distance_km) : "",
      travel_expense_amount: entry.travel_expense_amount != null ? String(entry.travel_expense_amount) : "",
    });
    setIsEditing(true);
  };

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["client-timeline"] });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry) return;
    const derived = deriveTimeEntryFields({
      date: form.date,
      totalHours: Number(form.total_hours) || 0,
      category: form.category,
    });
    await update.mutateAsync({
      id: entry.id,
      updates: {
        ...derived,
        category: form.category.trim() || null,
        activity_description: form.activity_description.trim() || null,
        travel_from: form.travel_from.trim() || null,
        travel_to: form.travel_to.trim() || null,
        travel_distance_km: form.travel_distance_km ? Number(form.travel_distance_km) : null,
        travel_expense_amount: form.travel_expense_amount ? Number(form.travel_expense_amount) : null,
      },
    });
    refresh();
    setIsEditing(false);
  };

  return (
    <>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-green-600" />
          Zeiteintrag
        </DialogTitle>
        <DialogDescription className="sr-only">Zeiteintrag-Detail</DialogDescription>

        {isLoading && (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
        {error && !isLoading && (
          <p className="py-8 text-center text-sm text-destructive">
            Zeiteintrag konnte nicht geladen werden.
          </p>
        )}

        {entry && !isLoading && !isEditing && (
          <div className="space-y-4">
            <div className="text-2xl font-bold">{entry.total_hours} Std.</div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Datum</dt>
                <dd className="font-medium">{formatDateDE(entry.date)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Kategorie</dt>
                <dd className="font-medium">{entry.category || "—"}</dd>
              </div>
            </dl>
            {entry.activity_description && (
              <div>
                <div className="text-xs text-muted-foreground">Tätigkeit</div>
                <div className="mt-1 rounded-md bg-muted/50 p-3 text-sm">
                  {entry.activity_description}
                </div>
              </div>
            )}
            {(entry.travel_from || entry.travel_to) && (
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Reise von</dt>
                  <dd className="font-medium">{entry.travel_from || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Reise nach</dt>
                  <dd className="font-medium">{entry.travel_to || "—"}</dd>
                </div>
                {entry.travel_distance_km != null && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Distanz</dt>
                    <dd className="font-medium">{entry.travel_distance_km} km</dd>
                  </div>
                )}
                {entry.travel_expense_amount != null && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Reisespesen</dt>
                    <dd className="font-medium">CHF {entry.travel_expense_amount}</dd>
                  </div>
                )}
              </dl>
            )}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="secondary" size="sm" onClick={startEdit}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Bearbeiten
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Löschen
              </Button>
            </div>
          </div>
        )}

        {entry && !isLoading && isEditing && (
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="te-date">Datum</Label>
                <Input
                  id="te-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="te-hours">Stunden</Label>
                <Input
                  id="te-hours"
                  type="number"
                  step="0.25"
                  value={form.total_hours}
                  onChange={(e) => setForm({ ...form, total_hours: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="te-category">Kategorie</Label>
              <Input
                id="te-category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="te-activity">Tätigkeit</Label>
              <Textarea
                id="te-activity"
                rows={3}
                value={form.activity_description}
                onChange={(e) => setForm({ ...form, activity_description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="te-tfrom">Reise von</Label>
                <Input
                  id="te-tfrom"
                  value={form.travel_from}
                  onChange={(e) => setForm({ ...form, travel_from: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="te-tto">Reise nach</Label>
                <Input
                  id="te-tto"
                  value={form.travel_to}
                  onChange={(e) => setForm({ ...form, travel_to: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="te-km">Distanz (km)</Label>
                <Input
                  id="te-km"
                  type="number"
                  step="0.1"
                  value={form.travel_distance_km}
                  onChange={(e) => setForm({ ...form, travel_distance_km: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="te-tamt">Reisespesen (CHF)</Label>
                <Input
                  id="te-tamt"
                  type="number"
                  step="0.01"
                  value={form.travel_expense_amount}
                  onChange={(e) => setForm({ ...form, travel_expense_amount: e.target.value })}
                />
              </div>
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
      </DialogContent>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zeiteintrag löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Dieser Zeiteintrag wird dauerhaft gelöscht. Möchten Sie wirklich fortfahren?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                if (!entry) return;
                await del.mutateAsync(entry.id);
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
