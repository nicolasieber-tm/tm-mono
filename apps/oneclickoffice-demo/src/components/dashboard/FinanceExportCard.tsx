import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FinanceRangeFilter } from "@/components/clients/FinanceRangeFilter";
import {
  type DateRange,
  type FinanceRangePreset,
} from "@/utils/entityFinances";
import {
  toMovements,
  filterMovements,
  buildFinanceCSV,
  exportFilename,
  type NameLookups,
  type ExportFilter,
} from "@/utils/financeExport";
import { triggerCsvDownload } from "@/utils/csvDownload";
import { useFinanceExportData } from "@/hooks/useFinanceExportData";
import { useClients } from "@/hooks/useClients";
import { useKunden } from "@/hooks/useKunden";
import { useIsSingleLevel } from "@/hooks/useClientHierarchyMode";

const ALL = "__all__";

const formatCHF = (n: number) =>
  new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(n);

export const FinanceExportCard = () => {
  const { invoices, expenses, isLoading } = useFinanceExportData();
  const { data: clients } = useClients();
  const { data: kunden } = useKunden();
  const isSingle = useIsSingleLevel();

  const [preset, setPreset] = useState<FinanceRangePreset>("all");
  const [range, setRange] = useState<DateRange>({ from: null, to: null });
  const [clientId, setClientId] = useState<string>(ALL);
  const [companyId, setCompanyId] = useState<string>(ALL);
  const [type, setType] = useState<ExportFilter["type"]>("all");
  const [status, setStatus] = useState<ExportFilter["status"]>("all");

  const lookups: NameLookups = useMemo(() => {
    const clientNames = new Map<string, string>();
    (clients ?? []).forEach((c) =>
      clientNames.set(c.id, `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim()),
    );
    const companyNames = new Map<string, string>();
    (kunden ?? []).forEach((k) => companyNames.set(k.id, k.name ?? ""));
    return { clientNames, companyNames };
  }, [clients, kunden]);

  const movements = useMemo(
    () => toMovements(invoices, expenses, lookups),
    [invoices, expenses, lookups],
  );

  const filter: ExportFilter = useMemo(
    () => ({
      range,
      clientId: clientId === ALL ? null : clientId,
      companyId: companyId === ALL ? null : companyId,
      type,
      status,
    }),
    [range, clientId, companyId, type, status],
  );

  const filtered = useMemo(
    () => filterMovements(movements, filter),
    [movements, filter],
  );

  const incomeSum = filtered
    .filter((m) => m.type === "income")
    .reduce((s, m) => s + m.amount, 0);
  const expenseSum = filtered
    .filter((m) => m.type === "expense")
    .reduce((s, m) => s + m.amount, 0);

  const handleExport = () => {
    const csv = buildFinanceCSV(filtered);
    const today = new Date().toISOString().slice(0, 10);
    triggerCsvDownload(csv, exportFilename(filter, today));
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl">Export</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Einnahmen und Ausgaben als CSV — filterbar nach Zeitraum, Klient,
          Kunde, Typ und Status.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <FinanceRangeFilter
          preset={preset}
          range={range}
          onChange={(p, r) => {
            setPreset(p);
            setRange(r);
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {!isSingle && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Klient</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Alle Klienten</SelectItem>
                  {(clients ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {`${c.first_name ?? ""} ${c.last_name ?? ""}`.trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Kunde</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Alle Kunden</SelectItem>
                {(kunden ?? []).map((k) => (
                  <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Typ</Label>
            <Select value={type} onValueChange={(v) => setType(v as ExportFilter["type"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="income">Nur Einnahmen</SelectItem>
                <SelectItem value="expense">Nur Ausgaben</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Status (Rechnungen)</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ExportFilter["status"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="paid">Bezahlt</SelectItem>
                <SelectItem value="sent">Offen</SelectItem>
                <SelectItem value="draft">Entwurf</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Entwürfe nur bei Auswahl „Entwurf" enthalten.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Lädt …"
              : `${filtered.length} Bewegungen · Einnahmen ${formatCHF(incomeSum)} · Ausgaben ${formatCHF(expenseSum)} · Saldo ${formatCHF(incomeSum - expenseSum)}`}
          </p>
          <Button onClick={handleExport} disabled={isLoading || filtered.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Als CSV exportieren
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
