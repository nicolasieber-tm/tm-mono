import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type Unternehmen = Database["public"]["Tables"]["unternehmen"]["Row"];
type UnternehmenInsert = Database["public"]["Tables"]["unternehmen"]["Insert"];
type UnternehmenUpdate = Database["public"]["Tables"]["unternehmen"]["Update"];

// Get shared unternehmen settings (accessible to all authenticated users)
export const useUnternehmen = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["unternehmen"],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("unternehmen")
        .select("*")
        .order("company_name", { ascending: true });

      if (error) {
        toast.error("Fehler beim Laden der Unternehmen", {
          description: error.message,
        });
        throw error;
      }
      return data || [];
    },
    enabled: !!user,
  });
};

// Create or update shared unternehmen settings (upsert)
export const useSaveUnternehmen = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (settings: Omit<UnternehmenInsert, "user_id">) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("unternehmen")
        .upsert({
          ...settings,
          user_id: user.id, // Track who last updated (not for access control)
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unternehmen"] });
      toast.success("Firmeneinstellungen erfolgreich gespeichert");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Speichern der Firmeneinstellungen", {
        description: error.message,
      });
    },
  });
};

// Update existing shared unternehmen settings
export const useUpdateUnternehmen = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UnternehmenUpdate;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("unternehmen")
        .update({
          ...updates,
          user_id: user.id, // Track who last updated (not for access control)
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unternehmen"] });
      toast.success("Firmeneinstellungen aktualisiert");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Aktualisieren der Firmeneinstellungen", {
        description: error.message,
      });
    },
  });
};
