import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Receipt, TrendingUp } from "lucide-react";
import { formatCHF } from "@/components/expenses/formatters";
import {
  useEntityFinances,
  type FinanceScope,
} from "@/hooks/useEntityFinances";
import { ClientTimeline } from "./ClientTimeline";

export interface StammdatenField {
  label: string;
  value: string;
}

interface Props {
  scope: FinanceScope;
  id: string;
  stammdaten: StammdatenField[];
}

const ALL_RANGE = { from: null, to: null } as const;

export const EntityOverviewTab = ({ scope, id, stammdaten }: Props) => {
  // Gesamt-Range (kein Zeitfilter) für die Kurz-Kennzahlen.
  const { summary } = useEntityFinances(scope, id, ALL_RANGE);

  const visibleFields = stammdaten.filter((f) => f.value.trim() !== "");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Einnahmen gesamt
            </div>
            <div className="mt-2 text-xl font-bold text-green-600">
              CHF {formatCHF(summary.einnahmenGesamt)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Receipt className="h-4 w-4 text-red-600" />
              Ausgaben gesamt
            </div>
            <div className="mt-2 text-xl font-bold text-red-600">
              CHF {formatCHF(summary.ausgaben.sum)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4 text-primary" />
              Saldo
            </div>
            <div
              className={`mt-2 text-xl font-bold ${
                summary.saldo >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              CHF {formatCHF(summary.saldo)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-3">Stammdaten</h3>
          {visibleFields.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine Stammdaten erfasst.</p>
          ) : (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {visibleFields.map((f) => (
                <div key={f.label} className="flex justify-between gap-4 border-b py-1">
                  <dt className="text-muted-foreground">{f.label}</dt>
                  <dd className="font-medium text-right">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </CardContent>
      </Card>

      {scope === "client" && (
        <Card>
          <CardContent className="p-4">
            <ClientTimeline clientId={id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
