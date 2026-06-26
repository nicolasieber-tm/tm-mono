import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CheckCircle2,
  Clock,
  Receipt,
  FileText,
} from "lucide-react";
import { formatCHF, formatDateDE } from "@/components/expenses/formatters";
import {
  useEntityFinances,
  type FinanceScope,
} from "@/hooks/useEntityFinances";
import { FinanceRangeFilter } from "./FinanceRangeFilter";
import type { DateRange, FinanceRangePreset } from "@/utils/entityFinances";

interface Props {
  scope: FinanceScope;
  id: string;
}

const StatCard = ({
  icon,
  label,
  count,
  amount,
  amountClass = "text-foreground",
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  amount: number;
  amountClass?: string;
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
        {count !== undefined && (
          <Badge variant="secondary" className="ml-auto">
            {count}
          </Badge>
        )}
      </div>
      <div className={`mt-2 text-xl font-bold ${amountClass}`}>
        CHF {formatCHF(amount)}
      </div>
    </CardContent>
  </Card>
);

export const EntityFinanceTab = ({ scope, id }: Props) => {
  const navigate = useNavigate();
  const [preset, setPreset] = useState<FinanceRangePreset>("all");
  const [range, setRange] = useState<DateRange>({ from: null, to: null });
  const { summary, isLoading, error } = useEntityFinances(scope, id, range);

  const handleRangeChange = (
    nextPreset: FinanceRangePreset,
    nextRange: DateRange,
  ) => {
    setPreset(nextPreset);
    setRange(nextRange);
  };

  const param = scope === "client" ? `client=${id}` : `company=${id}`;

  return (
    <div className="space-y-6">
      <FinanceRangeFilter
        preset={preset}
        range={range}
        onChange={handleRangeChange}
      />

      {error && !isLoading ? (
        <p className="text-sm text-destructive">
          Finanzdaten konnten nicht geladen werden.
        </p>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg border bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
              label="Einnahmen bezahlt"
              count={summary.einnahmenBezahlt.count}
              amount={summary.einnahmenBezahlt.sum}
              amountClass="text-green-600"
            />
            <StatCard
              icon={<Clock className="h-4 w-4 text-amber-600" />}
              label="Einnahmen ausstehend"
              count={summary.einnahmenOffen.count}
              amount={summary.einnahmenOffen.sum}
              amountClass="text-amber-600"
            />
            <StatCard
              icon={<Receipt className="h-4 w-4 text-red-600" />}
              label="Ausgaben/Spesen"
              count={summary.ausgaben.count}
              amount={summary.ausgaben.sum}
              amountClass="text-red-600"
            />
            <StatCard
              icon={<Wallet className="h-4 w-4 text-primary" />}
              label="Saldo"
              amount={summary.saldo}
              amountClass={summary.saldo >= 0 ? "text-green-600" : "text-red-600"}
            />
          </div>

          {summary.entwuerfe.count > 0 && (
            <p className="text-xs text-muted-foreground">
              {summary.entwuerfe.count === 1
                ? "1 Entwurf"
                : `${summary.entwuerfe.count} Entwürfe`}{" "}
              (CHF {formatCHF(summary.entwuerfe.sum)}) — nicht im Saldo gezählt.
            </p>
          )}

          <div>
            <h3 className="text-sm font-semibold mb-3">Letzte Bewegungen</h3>
            {summary.bewegungen.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                Keine Bewegungen im gewählten Zeitraum
              </div>
            ) : (
              <div className="space-y-2">
                {summary.bewegungen.map((m) => (
                  <div
                    key={`${m.type}-${m.id}`}
                    className="flex items-center justify-between rounded-md border bg-card p-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      {m.type === "income" ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium">{m.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDateDE(m.date)}
                          {m.type === "income" && m.status === "sent" && " · ausstehend"}
                          {m.type === "income" && m.status === "paid" && " · bezahlt"}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`font-semibold ${
                        m.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {m.type === "income" ? "+" : "−"} CHF {formatCHF(m.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/rechnungen?${param}`)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Alle Rechnungen
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/spesen?${param}`)}
            >
              <Receipt className="h-4 w-4 mr-2" />
              Alle Spesen
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
