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
import { useUpdateTimeEntry, useDeleteTimeEntry } from "@/hooks/useTimeEntries";
import { useTimeEntryCategories } from "@/hooks/useTimeEntryCategories";
import { TimeEntryRow } from "@/hooks/useTimeStats";

interface Props {
  entry: TimeEntryRow | null;
  onOpenChange: (open: boolean) => void;
}

const hoursToClock = (h: number) => {
  const total = Math.round((h ?? 0) * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};
const clockToHours = (v: string) => {
  const [h, m] = v.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return 0;
  return Number((h + m / 60).toFixed(2));
};

const displayName = (entry: TimeEntryRow) => {
  if (entry.clients) return `${entry.clients.first_name} ${entry.clients.last_name}`;
  if (entry.kunden) return entry.kunden.name;
  return "Ohne Zuordnung";
};

const MobileTimeEntrySheet = ({ entry, onOpenChange }: Props) => {
  const { data: categories } = useTimeEntryCategories();
  const updateEntry = useUpdateTimeEntry();
  const deleteEntry = useDeleteTimeEntry();

  const [clock, setClock] = useState("00:00");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!entry) return;
    setClock(hoursToClock(entry.total_hours ?? 0));
    setDate(entry.date ?? "");
    setCategory(entry.category ?? "");
    setDescription(entry.activity_description ?? "");
  }, [entry]);

  const busy = updateEntry.isPending || deleteEntry.isPending;

  const handleSave = async () => {
    if (!entry) return;
    const hours = clockToHours(clock);
    if (hours <= 0) {
      toast.error("Bitte eine gültige Dauer angeben");
      return;
    }
    try {
      await updateEntry.mutateAsync({
        id: entry.id,
        updates: {
          total_hours: hours,
          date,
          category: category || null,
          activity_description: description || null,
        },
      });
      onOpenChange(false);
    } catch {
      // Hook zeigt eigenen Error-Toast
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    try {
      await deleteEntry.mutateAsync(entry.id);
      onOpenChange(false);
    } catch {
      // Hook zeigt eigenen Error-Toast
    }
  };

  return (
    <Drawer open={!!entry} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="text-left">
            <DrawerTitle>Zeiteintrag bearbeiten</DrawerTitle>
            {entry && (
              <DrawerDescription>{displayName(entry)}</DrawerDescription>
            )}
          </DrawerHeader>

          <div className="px-4 space-y-4 pb-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-dur" className="text-sm font-semibold">Dauer</Label>
                <Input
                  id="edit-dur"
                  type="time"
                  className="h-12 text-center font-semibold tabular-nums"
                  value={clock}
                  onChange={(e) => setClock(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-date" className="text-sm font-semibold">Datum</Label>
                <Input
                  id="edit-date"
                  type="date"
                  className="h-12 text-center font-semibold"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Kategorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Keine Kategorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-desc" className="text-sm font-semibold">Beschreibung</Label>
              <Textarea
                id="edit-desc"
                rows={3}
                className="resize-none"
                placeholder="Was wurde gemacht?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                  <AlertDialogTitle>Eintrag löschen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Dieser Zeiteintrag wird dauerhaft entfernt. Das kann nicht rückgängig gemacht werden.
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
              {updateEntry.isPending ? (
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

export default MobileTimeEntrySheet;
