import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";
import type { ExportInvoice, ExportExpense } from "@/utils/financeExport";

interface RawData {
  invoices: ExportInvoice[];
  expenses: ExportExpense[];
}

const EMPTY: RawData = { invoices: [], expenses: [] };

/**
 * Lädt alle Rechnungen + Spesen des aktiven Mandanten für den Finanz-Export.
 * Bewusst ohne Entitäts-Einschränkung — gefiltert wird clientseitig in
 * FinanceExportCard via filterMovements().
 */
export function useFinanceExportData() {
  const { activeCompanyId } = useActiveCompany();

  const query = useQuery({
    queryKey: ["finance-export-data", activeCompanyId],
    enabled: !!activeCompanyId,
    queryFn: async (): Promise<RawData> => {
      const [invRes, expRes] = await Promise.all([
        supabase
          .from("invoices")
          .select("id, invoice_number, total, status, period_end, client_id, company_id")
          .eq("unternehmen_id", activeCompanyId!),
        supabase
          .from("expenses")
          .select("id, amount, status, expense_date, category, notes, client_id, company_id")
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
        invoices: (invRes.data ?? []) as ExportInvoice[],
        expenses: (expRes.data ?? []) as ExportExpense[],
      };
    },
  });

  const data = query.data ?? EMPTY;
  return {
    invoices: data.invoices,
    expenses: data.expenses,
    isLoading: query.isLoading,
    error: query.error,
  };
}
