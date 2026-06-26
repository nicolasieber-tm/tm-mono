import { useState, useEffect } from "react";
import { Loader2, Save, Users2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useUnternehmenSettings,
  useUpdateUnternehmenSettings,
  type ClientHierarchyMode,
} from "@/hooks/useUnternehmenSettings";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
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
import { toast } from "sonner";

const isMode = (v: string): v is ClientHierarchyMode =>
  v === "two_level" || v === "single_level";

const HierarchyModeSettings = () => {
  const navigate = useNavigate();
  const { data: settings, isLoading } = useUnternehmenSettings();
  const update = useUpdateUnternehmenSettings();
  const [selected, setSelected] = useState<ClientHierarchyMode>("two_level");
  const [blockerOpen, setBlockerOpen] = useState(false);
  const [blockerCount, setBlockerCount] = useState(0);

  useEffect(() => {
    if (settings?.client_hierarchy_mode) {
      setSelected(settings.client_hierarchy_mode);
    }
  }, [settings?.client_hierarchy_mode]);

  const hasChanged =
    settings?.client_hierarchy_mode !== undefined &&
    selected !== settings.client_hierarchy_mode;

  const handleSave = async () => {
    if (!settings?.id) return;

    // Only on 2 -> 1 switch: check client count first for nice UX
    if (
      settings.client_hierarchy_mode === "two_level" &&
      selected === "single_level"
    ) {
      const { count, error: countErr } = await supabase
        .from("clients")
        .select("id, kunden!inner(unternehmen_id)", {
          count: "exact",
          head: true,
        })
        .eq("kunden.unternehmen_id", settings.id);

      if (countErr) {
        toast.error("Fehler beim Prüfen der Klienten");
        return;
      }

      if ((count ?? 0) > 0) {
        setBlockerCount(count ?? 0);
        setBlockerOpen(true);
        return;
      }
    }

    update.mutate({ id: settings.id, client_hierarchy_mode: selected });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kunden-Hierarchie</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Kunden-Hierarchie</CardTitle>
              <CardDescription>
                Wähle, wie Kunden in diesem Mandanten strukturiert werden.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selected}
            onValueChange={(v) => isMode(v) && setSelected(v)}
            className="flex flex-col gap-3"
          >
            <Label
              htmlFor="mode-two"
              className="flex items-start gap-3 p-4 border-2 border-border rounded-xl cursor-pointer transition-colors hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <RadioGroupItem value="two_level" id="mode-two" className="mt-1" />
              <div>
                <div className="font-bold text-sm">
                  Zwei Ebenen: Kunde → Klient
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Für Therapiepraxen, Beratungen: Unternehmen haben Personen
                  darunter.
                </div>
              </div>
            </Label>
            <Label
              htmlFor="mode-one"
              className="flex items-start gap-3 p-4 border-2 border-border rounded-xl cursor-pointer transition-colors hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <RadioGroupItem value="single_level" id="mode-one" className="mt-1" />
              <div>
                <div className="font-bold text-sm">Eine Ebene: nur Kunde</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Für Handwerker, Agenturen, Coaches: direkte 1:1-Beziehung.
                </div>
              </div>
            </Label>
          </RadioGroup>

          <div className="flex justify-end pt-4 border-t mt-4">
            <Button
              onClick={handleSave}
              disabled={!hasChanged || update.isPending}
              className="min-w-[150px]"
            >
              {update.isPending ? (
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
      </Card>

      <AlertDialog open={blockerOpen} onOpenChange={setBlockerOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Umschaltung blockiert</AlertDialogTitle>
            <AlertDialogDescription>
              Du hast noch <strong>{blockerCount}</strong>{" "}
              {blockerCount === 1 ? "Klient" : "Klienten"} in diesem Mandanten.
              Bevor du auf die einfache Hierarchie wechseln kannst, musst du
              alle Klienten löschen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setBlockerOpen(false);
                navigate("/klienten");
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Zu Klienten wechseln
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default HierarchyModeSettings;
