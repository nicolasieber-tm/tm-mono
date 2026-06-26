import { useEffect, useRef, useState } from "react";
import { Loader2, Plus, Trash2, Save, AlertTriangle, ListTree } from "lucide-react";
import {
  useExpenseLineItems,
  useReplaceExpenseLineItems,
} from "@/hooks/useExpenseLineItems";
import { useBananaMappings } from "@/hooks/useBananaMappings";
import { useExpenseCategories } from "@/hooks/useExpenseCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sentinel für "keine Banana-Kategorie zugeordnet" (Select erlaubt keinen
// leeren value). Wird beim Speichern zurück auf null gemappt.
const NO_CATEGORY = "_NONE_";

interface LineDraft {
  key: string; // stabiler React-Key (DB-id oder temp-id)
  description: string;
  amount: string; // als String für das Input-Feld
  banana_category_key: string; // NO_CATEGORY für null
  category: string;            // NO_CATEGORY für null
}

interface Props {
  expenseId: string;
  /** Beleg-Total zur Plausibilitätsprüfung (Σ Positionen ≈ Betrag). */
  expenseAmount: number;
  /**
   * Steuert, ob Banana-spezifische UI (Kategorie-Spalte, Sammelkonto-Hinweise,
   * Banana-Texte) gerendert wird. Default true = bisheriges Verhalten.
   */
  bananaEnabled?: boolean;
}

/**
 * Zeigt und bearbeitet die AI-erkannten Belegpositionen (expense_line_items)
 * einer Spese.
 *
 * Kategorien je nach Modus:
 * - Banana-Modus (bananaEnabled=true): Kategorien stammen aus den
 *   unternehmens-spezifischen `banana_account_mappings` (Feld `banana_category_key`).
 *   Positionen ohne Zuordnung landen sonst auf dem Sammelkonto 6700.
 * - Non-Banana-Modus (bananaEnabled=false): Kategorien stammen aus den
 *   mandanteneigenen `expense_categories` (Feld `category`).
 */
export function ExpenseLineItemsEditor({
  expenseId,
  expenseAmount,
  bananaEnabled = true,
}: Props) {
  const { data: lineItems = [], isLoading } = useExpenseLineItems(expenseId);
  const { data: mappings = [] } = useBananaMappings();
  const { data: expenseCategories = [] } = useExpenseCategories();
  const replaceMutation = useReplaceExpenseLineItems();

  const [drafts, setDrafts] = useState<LineDraft[]>([]);
  // Sobald der User editiert, nicht mehr aus dem Query reinitialisieren
  // (sonst gingen ungespeicherte Änderungen bei einem Refetch verloren).
  const [dirty, setDirty] = useState(false);
  const tempIdRef = useRef(0);

  useEffect(() => {
    if (dirty) return;
    setDrafts(
      lineItems.map((li) => ({
        key: li.id,
        description: li.description ?? "",
        amount: li.amount != null ? String(li.amount) : "",
        banana_category_key: li.banana_category_key ?? NO_CATEGORY,
        category: li.category ?? NO_CATEGORY,
      }))
    );
  }, [lineItems, dirty]);

  const updateRow = (key: string, field: keyof Omit<LineDraft, "key">, value: string) => {
    setDirty(true);
    setDrafts((prev) =>
      prev.map((d) => (d.key === key ? { ...d, [field]: value } : d))
    );
  };

  const addRow = () => {
    setDirty(true);
    setDrafts((prev) => [
      ...prev,
      {
        key: `temp-${tempIdRef.current++}`,
        description: "",
        amount: "",
        banana_category_key: NO_CATEGORY,
        category: NO_CATEGORY,
      },
    ]);
  };

  const removeRow = (key: string) => {
    setDirty(true);
    setDrafts((prev) => prev.filter((d) => d.key !== key));
  };

  const handleSave = () => {
    const items = drafts.map((d) => ({
      description: d.description.trim(),
      amount: parseFloat(d.amount) || 0,
      banana_category_key:
        bananaEnabled && d.banana_category_key !== NO_CATEGORY
          ? d.banana_category_key
          : null,
      category:
        !bananaEnabled && d.category !== NO_CATEGORY ? d.category : null,
    }));
    replaceMutation.mutate(
      { expense_id: expenseId, items },
      { onSuccess: () => setDirty(false) }
    );
  };

  const sum = drafts.reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);
  const sumMismatch = expenseAmount > 0 && Math.abs(sum - expenseAmount) > 0.05;
  const missingCategory = drafts.filter(
    (d) => d.banana_category_key === NO_CATEGORY
  ).length;

  return (
    <div className="space-y-3 border p-3 rounded-md bg-muted/20">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <ListTree className="h-4 w-4 text-muted-foreground" />
          <Label className="font-medium">Belegpositionen</Label>
          {drafts.length > 0 && (
            <Badge variant="secondary">{drafts.length}</Badge>
          )}
        </div>
        {bananaEnabled && missingCategory > 0 && (
          <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600">
            <AlertTriangle className="h-3 w-3" />
            {missingCategory} ohne Kategorie
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="py-4 text-center text-sm text-muted-foreground">
          <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
          Positionen werden geladen...
        </div>
      ) : (
        <>
          {drafts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {bananaEnabled ? (
                <>
                  Keine Einzelpositionen erfasst – dieser Beleg wird beim
                  Banana-Export als <strong>eine</strong> Buchung exportiert. Du
                  kannst bei Bedarf manuell Positionen hinzufügen.
                </>
              ) : (
                <>
                  Keine Einzelpositionen erfasst. Du kannst bei Bedarf manuell
                  Positionen hinzufügen.
                </>
              )}
            </p>
          ) : (
            <div className="space-y-2">
              {bananaEnabled && missingCategory > 0 && (
                <p className="text-xs text-amber-600">
                  Positionen ohne Banana-Kategorie landen beim Export auf dem
                  Sammelkonto 6700. Bitte zuordnen.
                </p>
              )}
              {drafts.map((d) => {
                const noCat = d.banana_category_key === NO_CATEGORY;
                return (
                  <div
                    key={d.key}
                    className={`flex flex-col gap-2 sm:grid sm:grid-cols-[1fr_7rem_12rem_auto] sm:items-center rounded-md border p-2 ${
                      bananaEnabled && noCat ? "border-amber-300 bg-amber-50/50" : ""
                    }`}
                  >
                    <Input
                      value={d.description}
                      placeholder="Beschreibung"
                      onChange={(e) =>
                        updateRow(d.key, "description", e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={d.amount}
                      placeholder="0.00"
                      className="text-right"
                      onChange={(e) => updateRow(d.key, "amount", e.target.value)}
                    />
                    {bananaEnabled ? (
                      <Select
                        value={d.banana_category_key}
                        onValueChange={(v) =>
                          updateRow(d.key, "banana_category_key", v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kategorie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NO_CATEGORY}>
                            — nicht zugeordnet —
                          </SelectItem>
                          {mappings.map((m) => (
                            <SelectItem key={m.category_key} value={m.category_key}>
                              {m.category_label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select
                        value={d.category}
                        onValueChange={(v) => updateRow(d.key, "category", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kategorie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NO_CATEGORY}>
                            — nicht zugeordnet —
                          </SelectItem>
                          {expenseCategories.map((c) => (
                            <SelectItem key={c.id} value={c.name}>
                              {c.icon ? `${c.icon} ${c.name}` : c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(d.key)}
                      aria-label="Position entfernen"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}

              <div
                className={`flex justify-between text-sm pt-1 ${
                  sumMismatch ? "text-amber-600" : "text-muted-foreground"
                }`}
              >
                <span>Summe Positionen</span>
                <span className="font-medium tabular-nums">
                  CHF {sum.toFixed(2)}
                  {sumMismatch && (
                    <span className="ml-2 text-xs">
                      ≠ Beleg CHF {expenseAmount.toFixed(2)}
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-between gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={addRow}>
              <Plus className="h-4 w-4 mr-1" />
              Position
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={replaceMutation.isPending || !dirty}
            >
              {replaceMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Speichert...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Positionen speichern
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default ExpenseLineItemsEditor;
