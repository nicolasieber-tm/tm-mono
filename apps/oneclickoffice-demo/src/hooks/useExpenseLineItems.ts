import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type ExpenseLineItem =
  Database["public"]["Tables"]["expense_line_items"]["Row"];

type ExpenseLineItemInsert =
  Database["public"]["Tables"]["expense_line_items"]["Insert"];

type ExpenseLineItemUpdate =
  Database["public"]["Tables"]["expense_line_items"]["Update"];

const QUERY_KEY = "expense-line-items";

/**
 * Lade alle Line-Items einer Spese, sortiert nach `position`.
 * Wenn die Spese kein Line-Items hat (Hybrid-Modus, AI hat nur Total
 * extrahiert oder manuell erfasst), gibt das Hook ein leeres Array zurueck.
 */
export const useExpenseLineItems = (expenseId: string | null | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEY, expenseId],
    enabled: !!expenseId,
    queryFn: async (): Promise<ExpenseLineItem[]> => {
      if (!expenseId) return [];

      const { data, error } = await supabase
        .from("expense_line_items")
        .select("*")
        .eq("expense_id", expenseId)
        .order("position", { ascending: true });

      if (error) {
        toast.error("Fehler beim Laden der Positionen", {
          description: error.message,
        });
        throw error;
      }

      return data ?? [];
    },
  });
};

type ReplaceLineItemsPayload = {
  expense_id: string;
  items: Array<{
    description: string;
    amount: number;
    banana_category_key: string | null;
    category: string | null;
  }>;
};

/**
 * Ersetzt alle Line-Items einer Spese atomar (delete + insert).
 * Position wird auto-vergeben (1..N basierend auf items-Reihenfolge).
 * Wird vom Mobile-Editor nach manueller Korrektur aufgerufen.
 */
export const useReplaceExpenseLineItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ expense_id, items }: ReplaceLineItemsPayload) => {
      const { error: delError } = await supabase
        .from("expense_line_items")
        .delete()
        .eq("expense_id", expense_id);

      if (delError) throw delError;

      if (items.length === 0) return [];

      const rows: ExpenseLineItemInsert[] = items.map((item, idx) => ({
        expense_id,
        position: idx + 1,
        description: item.description,
        amount: item.amount,
        banana_category_key: item.banana_category_key,
        category: item.category,
        ai_confidence: null, // manuell vom User gesetzt
      }));

      const { data, error: insError } = await supabase
        .from("expense_line_items")
        .insert(rows)
        .select("*");

      if (insError) throw insError;
      return data ?? [];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, variables.expense_id],
      });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Positionen gespeichert");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Speichern der Positionen", {
        description: error.message,
      });
    },
  });
};

export const useUpdateExpenseLineItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      expense_id,
      updates,
    }: {
      id: string;
      expense_id: string;
      updates: Pick<
        ExpenseLineItemUpdate,
        "description" | "amount" | "banana_category_key" | "category"
      >;
    }) => {
      const { data, error } = await supabase
        .from("expense_line_items")
        .update(updates)
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;
      return { data, expense_id };
    },
    onSuccess: ({ expense_id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, expense_id] });
      toast.success("Position aktualisiert");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Aktualisieren", {
        description: error.message,
      });
    },
  });
};
