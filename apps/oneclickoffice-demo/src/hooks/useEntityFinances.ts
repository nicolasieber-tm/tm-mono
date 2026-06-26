import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";
import {
  aggregateFinances,
  type DateRange,
  type FinanceInvoice,
  type FinanceExpense,
  type FinanceSummary,
} from "@/utils/entityFinances";

export type FinanceScope = "client" | "company";

interface RawData {
  invoices: FinanceInvoice[];
  expenses: FinanceExpense[];
}

const EMPTY: RawData = { invoices: [], expenses: [] };

/**
 * Lädt alle Rechnungen + Spesen einer Entität (Klient oder Kunde) des aktiven
 * Mandanten und aggregiert sie clientseitig für den gewählten Zeitraum.
 * Range-Wechsel lösen KEINEN neuen DB-Roundtrip aus (Re-Aggregation via useMemo).
 */
export function useEntityFinances(
  scope: FinanceScope,
  id: string | undefined,
  range: DateRange,
) {
  const { activeCompanyId } = useActiveCompany();
  const column = scope === "client" ? "client_id" : "company_id";

  const query = useQuery({
    queryKey: ["entity-finances", scope, id, activeCompanyId],
    enabled: !!id && !!activeCompanyId,
    queryFn: async (): Promise<RawData> => {
      const [invRes, expRes] = await Promise.all([
        supabase
          .from("invoices")
          .select("id, invoice_number, total, status, period_end")
          .eq(column, id!)
          .eq("unternehmen_id", activeCompanyId!),
        supabase
          .from("expenses")
          .select("id, amount, status, expense_date, category, notes")
          .eq(column, id!)
          .eq("unternehmen_id", activeCompanyId!),
      ]);

      if (invRes.error) {
        toast.error("Fehler beim Laden der Rechnungen", {
          description: invRes.error.message,
        });
        throw invRes.error;
      }
      if (expRes.error) {
        toast.error("Fehler beim Laden der Spesen", {
          description: expRes.error.message,
        });
        throw expRes.error;
      }

      return {
        invoices: (invRes.data ?? []) as FinanceInvoice[],
        expenses: (expRes.data ?? []) as FinanceExpense[],
      };
    },
  });

  const summary: FinanceSummary = useMemo(() => {
    const raw = query.data ?? EMPTY;
    return aggregateFinances(raw.invoices, raw.expenses, range);
  }, [query.data, range]);

  return {
    summary,
    isLoading: query.isLoading,
    error: query.error,
  };
}
