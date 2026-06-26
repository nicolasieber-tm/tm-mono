import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";
import type { ExpenseCategory } from "@/components/expenses/types";

export type { ExpenseCategory };

// Fetch expense categories
export const useExpenseCategories = () => {
  const { activeCompanyId } = useActiveCompany();

  return useQuery({
    queryKey: ["expense_categories", activeCompanyId],
    enabled: !!activeCompanyId,
    queryFn: async () => {
      if (!activeCompanyId) return [];

      const { data, error } = await supabase
        .from("expense_categories")
        .select("*")
        .eq("unternehmen_id", activeCompanyId)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) {
        toast.error("Fehler beim Laden der Spesen-Kategorien", {
          description: error.message,
        });
        throw error;
      }

      return data as ExpenseCategory[];
    },
  });
};

// Create expense category
export const useCreateExpenseCategory = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useActiveCompany();

  return useMutation({
    mutationFn: async (
      input:
        | string
        | { name: string; icon?: string | null; color?: string | null }
    ) => {
      if (!activeCompanyId) {
        throw new Error("Kein ERP-Unternehmen ausgewählt");
      }

      const payload =
        typeof input === "string"
          ? { name: input, unternehmen_id: activeCompanyId }
          : {
              name: input.name,
              icon: input.icon ?? null,
              color: input.color ?? null,
              unternehmen_id: activeCompanyId,
            };

      const { data, error } = await supabase
        .from("expense_categories")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense_categories"] });
      toast.success("Kategorie erfolgreich erstellt");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Erstellen der Kategorie", {
        description: error.message,
      });
    },
  });
};

// Update expense category
export const useUpdateExpenseCategory = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useActiveCompany();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      icon,
      color,
    }: {
      id: string;
      name: string;
      icon?: string | null;
      color?: string | null;
    }) => {
      if (!activeCompanyId) {
        throw new Error("Kein ERP-Unternehmen ausgewählt");
      }

      const updatePayload: {
        name: string;
        unternehmen_id: string;
        icon?: string | null;
        color?: string | null;
      } = { name, unternehmen_id: activeCompanyId };

      if (icon !== undefined) updatePayload.icon = icon;
      if (color !== undefined) updatePayload.color = color;

      const { data, error } = await supabase
        .from("expense_categories")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense_categories"] });
      toast.success("Kategorie erfolgreich aktualisiert");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Aktualisieren der Kategorie", {
        description: error.message,
      });
    },
  });
};

// Delete expense category (soft delete)
export const useDeleteExpenseCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("expense_categories")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense_categories"] });
      toast.success("Kategorie erfolgreich gelöscht");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Löschen der Kategorie", {
        description: error.message,
      });
    },
  });
};
