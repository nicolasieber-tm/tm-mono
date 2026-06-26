import { useEffect, useState } from "react";
import { Loader2, Save, FileSpreadsheet, Sparkles, ExternalLink } from "lucide-react";
import {
  useUnternehmenBananaSettings,
  useUpdateUnternehmenBananaSettings,
  type BananaExportGranularity,
  type BananaPaymentMethod,
} from "@/hooks/useUnternehmenBananaSettings";
import { useUnternehmen } from "@/hooks/useUnternehmen";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const isGranularity = (v: string): v is BananaExportGranularity =>
  v === "per_line_item" || v === "per_receipt";

const isPaymentMethod = (v: string): v is BananaPaymentMethod =>
  ["bar", "bank", "kreditkarte", "privat_ausgelegt", "kreditor"].includes(v);

const PAYMENT_METHOD_LABELS: Record<BananaPaymentMethod, string> = {
  bar: "Bar",
  bank: "Bankkonto",
  kreditkarte: "Kreditkarte",
  privat_ausgelegt: "Privat ausgelegt",
  kreditor: "Auf Rechnung (Kreditor)",
};

const BananaExportSettings = () => {
  const { data: settings, isLoading } = useUnternehmenBananaSettings();
  const updateSettings = useUpdateUnternehmenBananaSettings();
  const { activeCompanyId } = useActiveCompany();
  const { data: companies = [] } = useUnternehmen();
  const company = activeCompanyId
    ? companies.find((c) => c.id === activeCompanyId)
    : companies[0];

  const persistedGranularity: BananaExportGranularity =
    settings && isGranularity(settings.banana_export_granularity ?? "")
      ? (settings.banana_export_granularity as BananaExportGranularity)
      : "per_line_item";
  const persistedMwst: boolean = settings?.is_mwst_pflichtig ?? false;
  const persistedPayment: BananaPaymentMethod =
    settings && isPaymentMethod(settings.banana_default_payment_method ?? "")
      ? (settings.banana_default_payment_method as BananaPaymentMethod)
      : "bar";

  const [granularity, setGranularity] = useState<BananaExportGranularity>(
    persistedGranularity,
  );
  const [mwst, setMwst] = useState<boolean>(persistedMwst);
  const [payment, setPayment] = useState<BananaPaymentMethod>(persistedPayment);

  useEffect(() => setGranularity(persistedGranularity), [persistedGranularity]);
  useEffect(() => setMwst(persistedMwst), [persistedMwst]);
  useEffect(() => setPayment(persistedPayment), [persistedPayment]);

  if (isLoading || !settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Banana Buchhaltung Export</CardTitle>
          <CardDescription>
            Konfiguration für den Export deiner Spesen nach Banana Buchhaltung.
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

  const isDirty =
    granularity !== persistedGranularity ||
    mwst !== persistedMwst ||
    payment !== persistedPayment;
  const isSaving = updateSettings.isPending;
  const persistedEnabled: boolean = settings.banana_export_enabled;

  // Master-Switch speichert sofort (kein separater Speichern-Klick nötig),
  // damit das Ein-/Ausblenden des Features direkt greift.
  const handleToggleEnabled = (checked: boolean) => {
    updateSettings.mutate({ id: settings.id, banana_export_enabled: checked });
  };

  const handleSave = () => {
    if (!isDirty || isSaving) return;
    updateSettings.mutate({
      id: settings.id,
      banana_export_granularity: granularity,
      is_mwst_pflichtig: mwst,
      banana_default_payment_method: payment,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileSpreadsheet
              className="h-5 w-5 text-primary"
              aria-hidden="true"
            />
          </div>
          <div className="flex-1">
            <CardTitle>Banana Buchhaltung Export</CardTitle>
            <CardDescription className="mt-1">
              Konfiguration für den Banana-Export deiner Spesen. Diese
              Einstellungen bestimmen, wie das Export-File aufgebaut ist.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Master-Switch: Banana-Export pro Mandant ein-/ausschaltbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <Label
              htmlFor="banana-enabled"
              className="text-sm font-semibold cursor-pointer"
            >
              Banana-Export aktivieren
            </Label>
            <p className="text-xs text-muted-foreground">
              Schaltet den Banana-Buchhaltungs-Export für diesen Mandanten ein.
              Ist er aus, erscheinen weder der Export-Button auf der Spesen-Seite
              noch die Detail-Einstellungen unten.
            </p>
          </div>
          <Switch
            id="banana-enabled"
            checked={persistedEnabled}
            disabled={isSaving}
            onCheckedChange={handleToggleEnabled}
          />
        </div>

        {!persistedEnabled && (
          <p className="text-sm text-muted-foreground">
            Aktiviere den Banana-Export oben, um Buchungs-Granularität,
            Konto-Mapping und den Export-Button zu nutzen.
          </p>
        )}

        {persistedEnabled && (
          <>
            {/* Firmen-Kontext fuer AI-Beleg-Erkennung */}
        <div className="space-y-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold">Firmen-Kontext für die AI-Beleg-Erkennung</p>
              <p className="text-xs text-muted-foreground">
                Diese Daten werden bei jeder Beleg-Extraktion an die AI übergeben. So kann sie z.B. erkennen, ob ein Beleg an deine Firma adressiert ist und ob die MWST-Nummer plausibel ist.
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm pt-2">
            <div>
              <dt className="text-xs text-muted-foreground">Firmenname</dt>
              <dd className="font-medium">{company?.company_name || <span className="text-muted-foreground italic">noch nicht gesetzt</span>}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">MWST-Nummer</dt>
              <dd className="font-medium font-mono text-xs">
                {company?.vat_number || <span className="text-muted-foreground italic font-sans">nicht gesetzt</span>}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Adresse</dt>
              <dd className="font-medium">
                {[company?.address, company?.zip, company?.city].filter(Boolean).join(", ") ||
                  <span className="text-muted-foreground italic">noch nicht gesetzt</span>}
              </dd>
            </div>
          </dl>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <ExternalLink className="mr-2 h-3 w-3" />
            Firmendaten oben bearbeiten
          </Button>
        </div>

        {/* Granularität: pro Beleg vs. pro Position */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">
            Buchungssatz-Granularität
          </Label>
          <p className="text-xs text-muted-foreground">
            Wie viele Buchungssätze soll Banana pro Beleg erhalten?
          </p>

          <RadioGroup
            value={granularity}
            onValueChange={(v) => {
              if (isGranularity(v)) setGranularity(v);
            }}
            className="flex flex-col gap-3"
            aria-label="Banana Granularität"
          >
            <Label
              htmlFor="granularity-multi"
              className="flex items-start gap-3 p-4 border-2 border-border rounded-xl cursor-pointer transition-colors hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <RadioGroupItem
                value="per_line_item"
                id="granularity-multi"
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">
                    Pro Position eine Buchung (Multi-Line)
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] uppercase tracking-wide"
                  >
                    Empfohlen
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Jede einzelne Position auf dem Beleg (z.B. Migros mit 30
                  Items) wird ein eigener Banana-Buchungssatz mit eigenem
                  Konto/MWST. Präziser für die Buchhaltung.
                </p>
              </div>
            </Label>

            <Label
              htmlFor="granularity-single"
              className="flex items-start gap-3 p-4 border-2 border-border rounded-xl cursor-pointer transition-colors hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <RadioGroupItem
                value="per_receipt"
                id="granularity-single"
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <span className="font-semibold text-sm text-foreground block">
                  Pro Beleg eine Buchung (One-Line)
                </span>
                <p className="text-xs text-muted-foreground">
                  Der ganze Beleg wird zu einem einzigen Banana-Buchungssatz
                  zusammengefasst. Konto = die dominante Kategorie aller
                  Positionen. Einfacher, aber weniger präzise.
                </p>
              </div>
            </Label>
          </RadioGroup>
        </div>

        {/* MWST-Pflicht */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <Label
                htmlFor="banana-mwst"
                className="text-sm font-semibold cursor-pointer"
              >
                MWST-Pflichtig
              </Label>
              <p className="text-xs text-muted-foreground">
                Wenn aktiv, exportiert Banana den VatCode pro Buchung. Sonst
                bleibt das Feld leer.
              </p>
            </div>
            <Switch
              id="banana-mwst"
              checked={mwst}
              onCheckedChange={setMwst}
            />
          </div>
        </div>

        {/* Default-Zahlungsmittel */}
        <div className="space-y-3 pt-4 border-t">
          <Label htmlFor="banana-payment" className="text-sm font-semibold">
            Standard-Zahlungsmittel (Haben-Konto)
          </Label>
          <p className="text-xs text-muted-foreground">
            Welches Konto wird beim Export als Gegenkonto (Haben) verwendet,
            wenn die einzelne Spese keine andere Zahlungsmethode angibt?
          </p>
          <Select
            value={payment}
            onValueChange={(v) => {
              if (isPaymentMethod(v)) setPayment(v);
            }}
          >
            <SelectTrigger id="banana-payment" className="w-full max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PAYMENT_METHOD_LABELS) as BananaPaymentMethod[]).map(
                (key) => (
                  <SelectItem key={key} value={key}>
                    {PAYMENT_METHOD_LABELS[key]}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="min-w-[150px]"
          >
            {isSaving ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BananaExportSettings;
