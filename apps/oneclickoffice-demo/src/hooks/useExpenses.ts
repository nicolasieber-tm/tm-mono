import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";

type Expense = Database["public"]["Tables"]["expenses"]["Row"];
type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"];
type ExpenseUpdate = Database["public"]["Tables"]["expenses"]["Update"];

// Fetch all expenses
export const useExpenses = () => {
  const { activeCompanyId } = useActiveCompany();

  return useQuery({
    queryKey: ["expenses", activeCompanyId],
    enabled: !!activeCompanyId,
    queryFn: async () => {
      if (!activeCompanyId) return [];

      const { data, error } = await supabase
        .from("expenses")
        .select(`
          *,
          kunden(name),
          clients(first_name, last_name),
          employees(first_name, last_name)
        `)
        .eq("unternehmen_id", activeCompanyId)
        .order("expense_date", { ascending: false });

      if (error) {
        toast.error("Fehler beim Laden der Spesen", {
          description: error.message,
        });
        throw error;
      }

      return data;
    },
  });
};

// Fetch single expense
export const useExpense = (id: string) => {
  return useQuery({
    queryKey: ["expenses", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Fehler beim Laden der Spese", {
          description: error.message,
        });
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
};

// Create expense
export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useActiveCompany();

  return useMutation({
    mutationFn: async (expense: ExpenseInsert) => {
      if (!activeCompanyId) {
        throw new Error("Kein ERP-Unternehmen ausgewählt");
      }

      const { data, error } = await supabase
        .from("expenses")
        .insert({
          ...expense,
          unternehmen_id: activeCompanyId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Spese erfolgreich erstellt");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Erstellen", {
        description: error.message,
      });
    },
  });
};

// Update expense
export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useActiveCompany();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ExpenseUpdate }) => {
      if (!activeCompanyId) {
        throw new Error("Kein ERP-Unternehmen ausgewählt");
      }

      const { data, error } = await supabase
        .from("expenses")
        .update({
          ...updates,
          unternehmen_id: activeCompanyId,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses", data.id] });
      toast.success("Spese erfolgreich aktualisiert");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Aktualisieren", {
        description: error.message,
      });
    },
  });
};

// Delete expense
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Spese erfolgreich gelöscht");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Löschen", {
        description: error.message,
      });
    },
  });
};

// Create recurring expense template
export const useCreateRecurringExpense = () => {
  const { activeCompanyId } = useActiveCompany();

  return useMutation({
    mutationFn: async (recurringExpense: Omit<Database["public"]["Tables"]["recurring_expenses"]["Insert"], "unternehmen_id">) => {
      if (!activeCompanyId) {
        throw new Error("Kein ERP-Unternehmen ausgewählt");
      }

      const { data, error } = await supabase
        .from("recurring_expenses")
        .insert({
          ...recurringExpense,
          unternehmen_id: activeCompanyId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Wiederkehrende Spese erfolgreich erstellt");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Erstellen der wiederkehrenden Spese", {
        description: error.message,
      });
    },
  });
};
