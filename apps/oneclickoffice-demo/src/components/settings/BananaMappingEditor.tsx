import { useEffect, useState } from "react";
import { Loader2, RotateCcw, Save, FileSpreadsheet } from "lucide-react";
import {
  useBananaMappings,
  useUpdateBananaMapping,
  useResetBananaMapping,
  type BananaMapping,
} from "@/hooks/useBananaMappings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const VAT_OPTIONS: { value: string; label: string; hint: string }[] = [
  { value: "M81", label: "M81 (8.1%)", hint: "Vorsteuer normal" },
  { value: "M26", label: "M26 (2.6%)", hint: "Vorsteuer reduziert (Esse, Bücher)" },
  { value: "M38", label: "M38 (3.8%)", hint: "Vorsteuer Beherbergung" },
  { value: "_NONE_", label: "—", hint: "Keine MwSt" },
];

interface RowDraft {
  account_debit: string;
  vat_code: string; // "_NONE_" für NULL
}

const BananaMappingEditor = () => {
  const { data: mappings = [], isLoading } = useBananaMappings();
  const updateMutation = useUpdateBananaMapping();
  const resetMutation = useResetBananaMapping();

  // Pro mapping.id ein Draft-Zustand
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>({});

  // Bei Load drafts initialisieren
  useEffect(() => {
    if (mappings.length === 0) return;
    setDrafts((prev) => {
      const next = { ...prev };
      for (const m of mappings) {
        if (!next[m.id]) {
          next[m.id] = {
            account_debit: m.account_debit,
            vat_code: m.vat_code ?? "_NONE_",
          };
        }
      }
      return next;
    });
  }, [mappings]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Konto-Nummern pro Kategorie</CardTitle>
          <CardDescription>Lade Mappings…</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  const isDirty = (m: BananaMapping) => {
    const d = drafts[m.id];
    if (!d) return false;
    return (
      d.account_debit !== m.account_debit ||
      (d.vat_code === "_NONE_" ? null : d.vat_code) !== (m.vat_code ?? null)
    );
  };

  const handleSaveRow = (m: BananaMapping) => {
    const d = drafts[m.id];
    if (!d) return;
    updateMutation.mutate({
      id: m.id,
      updates: {
        account_debit: d.account_debit.trim(),
        vat_code: d.vat_code === "_NONE_" ? null : d.vat_code,
      },
    });
  };

  const handleResetRow = (m: BananaMapping) => {
    resetMutation.mutate(m.category_key);
  };

  const handleDraftChange = (id: string, patch: Partial<RowDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
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
            <CardTitle>Konto-Nummern pro Kategorie</CardTitle>
            <CardDescription className="mt-1">
              Welche Konto-Nummer bedeutet was? Pro Spese-Kategorie hier das
              Soll-Konto und den MWST-Code anpassen. Die AI nutzt diese
              Mappings, um pro Beleg-Position direkt das richtige Banana-Konto
              vorzuschlagen — du musst beim Erfassen nichts mehr nachschauen.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="hidden sm:grid grid-cols-12 gap-3 px-2 pb-2 text-xs font-semibold text-muted-foreground border-b">
            <div className="col-span-4">Spese-Kategorie</div>
            <div className="col-span-3">Konto (Soll)</div>
            <div className="col-span-3">MWST-Code</div>
            <div className="col-span-2 text-right">Aktion</div>
          </div>

          {mappings.map((m) => {
            const d = drafts[m.id] ?? {
              account_debit: m.account_debit,
              vat_code: m.vat_code ?? "_NONE_",
            };
            const dirty = isDirty(m);
            const isUpdatingThis =
              updateMutation.isPending &&
              updateMutation.variables?.id === m.id;
            const isResettingThis =
              resetMutation.isPending &&
              resetMutation.variables === m.category_key;

            return (
              <div
                key={m.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start sm:items-center p-3 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="col-span-1 sm:col-span-4 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">
                      {m.category_label}
                    </span>
                    {m.is_default ? (
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        Default
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] uppercase">
                        Angepasst
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {m.category_key}
                  </p>
                </div>

                <div className="col-span-1 sm:col-span-3">
                  <Label className="text-xs sm:hidden text-muted-foreground">
                    Konto (Soll)
                  </Label>
                  <Input
                    value={d.account_debit}
                    onChange={(e) =>
                      handleDraftChange(m.id, { account_debit: e.target.value })
                    }
                    placeholder="z.B. 6500"
                    className="font-mono"
                    inputMode="numeric"
                  />
                </div>

                <div className="col-span-1 sm:col-span-3">
                  <Label className="text-xs sm:hidden text-muted-foreground">
                    MWST-Code
                  </Label>
                  <Select
                    value={d.vat_code}
                    onValueChange={(v) =>
                      handleDraftChange(m.id, { vat_code: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VAT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{opt.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {opt.hint}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-1 sm:col-span-2 flex gap-1 justify-end">
                  {!m.is_default && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleResetRow(m)}
                      disabled={isResettingThis || isUpdatingThis}
                      title="Auf Default zurücksetzen"
                    >
                      {isResettingThis ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleSaveRow(m)}
                    disabled={!dirty || isUpdatingThis || isResettingThis}
                  >
                    {isUpdatingThis ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          {mappings.length} Kategorien • Geänderte Mappings sind als „Angepasst"
          markiert. Mit dem Reset-Knopf (Pfeil-Icon) setzt du eine einzelne
          Zeile auf den Schweizer KMU-Plan-Default zurück.
        </p>
      </CardContent>
    </Card>
  );
};

export default BananaMappingEditor;
