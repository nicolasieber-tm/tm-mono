import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";
import {
  mapNotes,
  mapInvoices,
  mapTimeEntries,
  mapExpenses,
  mergeTimeline,
  type TimelineEvent,
  type TimelineNoteInput,
  type TimelineInvoiceInput,
  type TimelineTimeInput,
  type TimelineExpenseInput,
} from "@/utils/clientTimeline";

interface RawData {
  notes: TimelineNoteInput[];
  invoices: TimelineInvoiceInput[];
  timeEntries: TimelineTimeInput[];
  expenses: TimelineExpenseInput[];
}

const EMPTY: RawData = { notes: [], invoices: [], timeEntries: [], expenses: [] };

/**
 * Lädt alle datierten Ereignisse eines Klienten (Notizen, Rechnungen,
 * Zeiterfassung, Spesen) des aktiven Mandanten parallel und mischt sie
 * clientseitig zu einem absteigend sortierten Zeitstrahl. Filter/Paginierung
 * passieren in der Komponente (kein Refetch).
 */
export function useClientTimeline(clientId: string | undefined) {
  const { activeCompanyId } = useActiveCompany();

  const query = useQuery({
    queryKey: ["client-timeline", clientId, activeCompanyId],
    enabled: !!clientId && !!activeCompanyId,
    queryFn: async (): Promise<RawData> => {
      const [notesRes, invRes, timeRes, expRes] = await Promise.all([
        // client_notes: per RLS auf Mandant gefiltert (wie useClientNotes),
        // soft-deleted ausgeschlossen.
        supabase
          .from("client_notes")
          .select("id, content, session_date, created_at")
          .eq("client_id", clientId!)
          .is("deleted_at", null),
        supabase
          .from("invoices")
          .select("id, invoice_number, total, status, created_at, period_start, period_end")
          .eq("client_id", clientId!)
          .eq("unternehmen_id", activeCompanyId!),
        supabase
          .from("time_entries")
          .select("id, date, total_hours, activity_description, category")
          .eq("client_id", clientId!)
          .eq("unternehmen_id", activeCompanyId!),
        supabase
          .from("expenses")
          .select("id, amount, status, expense_date, category, notes")
          .eq("client_id", clientId!)
          .eq("unternehmen_id", activeCompanyId!),
      ]);

      const labelled = [
        ["Notizen", notesRes],
        ["Rechnungen", invRes],
        ["Zeiterfassung", timeRes],
        ["Spesen", expRes],
      ] as const;
      for (const [label, res] of labelled) {
        if (res.error) {
          toast.error(`Fehler beim Laden (${label})`, {
            description: res.error.message,
          });
          throw res.error;
        }
      }

      return {
        notes: (notesRes.data ?? []) as TimelineNoteInput[],
        invoices: (invRes.data ?? []) as TimelineInvoiceInput[],
        timeEntries: (timeRes.data ?? []) as TimelineTimeInput[],
        expenses: (expRes.data ?? []) as TimelineExpenseInput[],
      };
    },
  });

  const events: TimelineEvent[] = useMemo(() => {
    const raw = query.data ?? EMPTY;
    return mergeTimeline([
      ...mapNotes(raw.notes),
      ...mapInvoices(raw.invoices),
      ...mapTimeEntries(raw.timeEntries),
      ...mapExpenses(raw.expenses),
    ]);
  }, [query.data]);

  return { events, isLoading: query.isLoading, error: query.error };
}
