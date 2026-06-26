import { useEffect, useState } from "react";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import {
  useUnternehmenSettings,
  useUpdateUnternehmenSettings,
  type ClientNotesVisibility,
} from "@/hooks/useUnternehmenSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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

const isVisibilityValue = (value: string): value is ClientNotesVisibility =>
  value === "alle_mitarbeiter" || value === "nur_autor";

const NotesVisibilitySettings = () => {
  const { data: settings, isLoading } = useUnternehmenSettings();
  const updateSettings = useUpdateUnternehmenSettings();

  const persistedVisibility: ClientNotesVisibility =
    settings && isVisibilityValue(settings.client_notes_visibility)
      ? settings.client_notes_visibility
      : "alle_mitarbeiter";

  const [selected, setSelected] = useState<ClientNotesVisibility>(persistedVisibility);
  const [warnDialogOpen, setWarnDialogOpen] = useState(false);

  // Keep local state in sync when persisted value changes (initial load + after save).
  useEffect(() => {
    setSelected(persistedVisibility);
  }, [persistedVisibility]);

  if (isLoading || !settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sichtbarkeit der Sitzungsnotizen</CardTitle>
          <CardDescription>
            Steuere, wer in deiner Praxis Sitzungsnotizen anderer Mitarbeiter sehen darf.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
  }

  const isDirty = selected !== persistedVisibility;
  const isSaving = updateSettings.isPending;

  const performSave = (next: ClientNotesVisibility) => {
    updateSettings.mutate({
      id: settings.id,
      client_notes_visibility: next,
    });
  };

  const handleSave = () => {
    if (!isDirty || isSaving) return;

    // Warn-Dialog nur bei Wechsel alle_mitarbeiter -> nur_autor
    if (persistedVisibility === "alle_mitarbeiter" && selected === "nur_autor") {
      setWarnDialogOpen(true);
      return;
    }

    performSave(selected);
  };

  const handleConfirmRestrict = () => {
    setWarnDialogOpen(false);
    performSave("nur_autor");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <CardTitle>Sichtbarkeit der Sitzungsnotizen</CardTitle>
            <CardDescription className="mt-1">
              Steuere, wer in deiner Praxis Sitzungsnotizen anderer Mitarbeiter sehen darf.
              Bestehende Notizen werden bei einer Änderung nicht gelöscht — nur ihre Sichtbarkeit ändert sich.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={selected}
          onValueChange={(value) => {
            if (isVisibilityValue(value)) setSelected(value);
          }}
          className="flex flex-col gap-3"
          aria-label="Sichtbarkeitsmodus für Sitzungsnotizen"
        >
          <Label
            htmlFor="notes-visibility-alle"
            className="flex items-start gap-3 p-4 border-2 border-border rounded-xl cursor-pointer transition-colors hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
          >
            <RadioGroupItem value="alle_mitarbeiter" id="notes-visibility-alle" className="mt-1" />
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-sm text-foreground">
                  Alle Mitarbeiter unserer Praxis sehen alle Sitzungsnotizen
                </span>
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                  Empfohlen für kleine Teams
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Ideal, wenn sich euer Team gegenseitig vertritt und Notizen für die Übergabe braucht.
              </p>
            </div>
          </Label>

          <Label
            htmlFor="notes-visibility-autor"
            className="flex items-start gap-3 p-4 border-2 border-border rounded-xl cursor-pointer transition-colors hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
          >
            <RadioGroupItem value="nur_autor" id="notes-visibility-autor" className="mt-1" />
            <div className="flex-1 space-y-1">
              <span className="font-semibold text-sm text-foreground block">
                Jeder sieht nur seine eigenen Sitzungsnotizen
              </span>
              <p className="text-xs text-muted-foreground">
                Strenge Trennung pro Mitarbeiter. Notizen anderer bleiben in der Datenbank, sind aber ausgeblendet.
              </p>
            </div>
          </Label>
        </RadioGroup>

        <div className="flex justify-end pt-2 border-t">
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="min-w-[150px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Wird gespeichert...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                Speichern
              </>
            )}
          </Button>
        </div>
      </CardContent>

      <AlertDialog open={warnDialogOpen} onOpenChange={setWarnDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sichtbarkeit einschränken?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Änderung versteckt ab sofort alle Notizen anderer Mitarbeiter für dich und für alle in deiner Praxis (außer Notizen die sie selbst geschrieben haben). Bestehende Notizen werden nicht gelöscht, nur ausgeblendet. Bist du sicher?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRestrict}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ja, umstellen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default NotesVisibilitySettings;
