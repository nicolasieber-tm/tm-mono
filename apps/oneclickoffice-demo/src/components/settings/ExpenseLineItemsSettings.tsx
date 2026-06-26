import { ListTree } from "lucide-react";
import {
  useUnternehmenSettings,
  useUpdateUnternehmenSettings,
} from "@/hooks/useUnternehmenSettings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

const ExpenseLineItemsSettings = () => {
  const { data: settings, isLoading } = useUnternehmenSettings();
  const updateSettings = useUpdateUnternehmenSettings();

  if (isLoading || !settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spesen · Belegpositionen</CardTitle>
          <CardDescription>
            Lege fest, ob die einzelnen Positionen eines Belegs im
            Spesen-Detail angezeigt und bearbeitet werden können.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  const persistedEnabled: boolean = settings.expense_line_items_enabled;
  const isSaving = updateSettings.isPending;

  // Sofort speichern, damit das Ein-/Ausblenden des Editors direkt greift.
  const handleToggle = (checked: boolean) => {
    updateSettings.mutate({
      id: settings.id,
      expense_line_items_enabled: checked,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ListTree className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <CardTitle>Spesen · Belegpositionen</CardTitle>
            <CardDescription className="mt-1">
              Wenn aktiv, erscheint im Spesen-Detail ein Editor mit den
              einzelnen Positionen eines Belegs (Beschreibung und Betrag). Die
              Positionen werden von der KI ohnehin immer erkannt; dieser
              Schalter steuert nur ihre Anzeige. Hinweis: Bei aktivem
              Banana-Export werden die Positionen inkl. Banana-Kategorien
              ohnehin angezeigt.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <Label
              htmlFor="expense-line-items"
              className="text-sm font-semibold cursor-pointer"
            >
              Belegpositionen anzeigen
            </Label>
            <p className="text-xs text-muted-foreground">
              Ist die Option aus, erscheint im Spesen-Detail kein
              Positionen-Editor (ausser der Banana-Export ist aktiv). Bereits
              gespeicherte Positionen bleiben in der Datenbank erhalten.
            </p>
          </div>
          <Switch
            id="expense-line-items"
            checked={persistedEnabled}
            disabled={isSaving}
            onCheckedChange={handleToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseLineItemsSettings;
