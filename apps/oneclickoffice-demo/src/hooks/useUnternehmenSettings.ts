import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type ClientNotesVisibility = "alle_mitarbeiter" | "nur_autor";
export type ClientHierarchyMode = "two_level" | "single_level";

export type UnternehmenSettings = Pick<
  Database["public"]["Tables"]["unternehmen"]["Row"],
  | "id"
  | "client_notes_visibility"
  | "client_hierarchy_mode"
  | "expense_client_linking_enabled"
  | "expense_line_items_enabled"
>;

export const useUnternehmenSettings = () => {
  return useQuery({
    queryKey: ["unternehmen-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unternehmen")
        .select(
          "id, client_notes_visibility, client_hierarchy_mode, expense_client_linking_enabled, expense_line_items_enabled"
        )
        .single();

      if (error) {
        toast.error("Fehler beim Laden der Unternehmens-Einstellungen", {
          description: error.message,
        });
        throw error;
      }

      return data as UnternehmenSettings;
    },
  });
};

type UpdatePayload = Partial<
  Pick<
    UnternehmenSettings,
    | "client_notes_visibility"
    | "client_hierarchy_mode"
    | "expense_client_linking_enabled"
    | "expense_line_items_enabled"
  >
> & { id: string };

export const useUpdateUnternehmenSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdatePayload) => {
      const { data, error } = await supabase
        .from("unternehmen")
        .update(updates)
        .eq("id", id)
        .select(
          "id, client_notes_visibility, client_hierarchy_mode, expense_client_linking_enabled, expense_line_items_enabled"
        )
        .single();

      if (error) throw error;
      return data as UnternehmenSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unternehmen-settings"] });
      queryClient.invalidateQueries({ queryKey: ["client-notes"] });
      queryClient.invalidateQueries({ queryKey: ["client-hierarchy-mode"] });
      toast.success("Einstellungen gespeichert");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Speichern der Einstellungen", {
        description: error.message,
      });
    },
  });
};
