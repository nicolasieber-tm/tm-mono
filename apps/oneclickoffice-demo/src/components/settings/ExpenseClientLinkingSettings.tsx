import { Users } from "lucide-react";
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

const ExpenseClientLinkingSettings = () => {
  const { data: settings, isLoading } = useUnternehmenSettings();
  const updateSettings = useUpdateUnternehmenSettings();

  if (isLoading || !settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spesen · Kunden-/Klientenzuordnung</CardTitle>
          <CardDescription>
            Lege fest, ob Spesen einem Kunden/Klienten zugeordnet werden können.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  const persistedEnabled: boolean = settings.expense_client_linking_enabled;
  const isSaving = updateSettings.isPending;

  // Sofort speichern, damit das Ein-/Ausblenden der Auswahl direkt greift.
  const handleToggle = (checked: boolean) => {
    updateSettings.mutate({
      id: settings.id,
      expense_client_linking_enabled: checked,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <CardTitle>Spesen · Kunden-/Klientenzuordnung</CardTitle>
            <CardDescription className="mt-1">
              Wenn aktiv, kann beim Erfassen einer Spese (Desktop und Mobile)
              optional ein Kunde/Klient gewählt werden. Die Auswahl folgt der
              eingestellten Kunden-Hierarchie: bei zwei Ebenen zuerst Firma,
              dann Klient; bei einer Ebene nur der Kunde.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <Label
              htmlFor="expense-client-linking"
              className="text-sm font-semibold cursor-pointer"
            >
              Zuordnung aktivieren
            </Label>
            <p className="text-xs text-muted-foreground">
              Ist die Option aus, erscheint in den Spesen-Formularen keine
              Kunde-/Klient-Auswahl. Bereits gespeicherte Zuordnungen bleiben
              in der Datenbank erhalten.
            </p>
          </div>
          <Switch
            id="expense-client-linking"
            checked={persistedEnabled}
            disabled={isSaving}
            onCheckedChange={handleToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseClientLinkingSettings;
