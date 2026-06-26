import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";
import { PostgrestError } from "@supabase/supabase-js";

type TimeEntryCategory = Database["public"]["Tables"]["time_entry_categories"]["Row"];
type TimeEntryCategoryInsert = Database["public"]["Tables"]["time_entry_categories"]["Insert"];
type TimeEntryCategoryUpdate = Database["public"]["Tables"]["time_entry_categories"]["Update"];

const getCategoryErrorMessage = (error: PostgrestError | Error) => {
  if ((error as PostgrestError)?.code === "23505") {
    return "Eine Kategorie mit diesem Namen existiert bereits.";
  }
  return error.message;
};

// Fetch all categories
export const useTimeEntryCategories = () => {
  const { activeCompanyId } = useActiveCompany();

  return useQuery({
    queryKey: ["time_entry_categories", activeCompanyId],
    enabled: !!activeCompanyId,
    queryFn: async () => {
      if (!activeCompanyId) return [];

      const { data, error } = await supabase
        .from("time_entry_categories")
        .select("*")
        .eq("unternehmen_id", activeCompanyId)
        .order("name", { ascending: true });

      if (error) {
        toast.error("Fehler beim Laden der Kategorien", {
          description: error.message,
        });
        throw error;
      }

      return data;
    },
  });
};

// Create category
export const useCreateTimeEntryCategory = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useActiveCompany();

  return useMutation({
    mutationFn: async (category: TimeEntryCategoryInsert) => {
      if (!activeCompanyId) {
        throw new Error("Kein ERP-Unternehmen ausgewählt");
      }

      const { data, error } = await supabase
        .from("time_entry_categories")
        .insert({
          ...category,
          unternehmen_id: activeCompanyId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time_entry_categories"] });
      toast.success("Kategorie erfolgreich erstellt");
    },
    onError: (error: PostgrestError | Error) => {
      toast.error("Fehler beim Erstellen der Kategorie", {
        description: getCategoryErrorMessage(error),
      });
    },
  });
};

// Update category
export const useUpdateTimeEntryCategory = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useActiveCompany();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TimeEntryCategoryUpdate }) => {
      if (!activeCompanyId) {
        throw new Error("Kein ERP-Unternehmen ausgewählt");
      }

      const { data, error } = await supabase
        .from("time_entry_categories")
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
      queryClient.invalidateQueries({ queryKey: ["time_entry_categories"] });
      toast.success("Kategorie erfolgreich aktualisiert");
    },
    onError: (error: PostgrestError | Error) => {
      toast.error("Fehler beim Aktualisieren der Kategorie", {
        description: getCategoryErrorMessage(error),
      });
    },
  });
};

// Delete category
export const useDeleteTimeEntryCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("time_entry_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time_entry_categories"] });
      toast.success("Kategorie erfolgreich gelöscht");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Löschen der Kategorie", {
        description: error.message,
      });
    },
  });
};
