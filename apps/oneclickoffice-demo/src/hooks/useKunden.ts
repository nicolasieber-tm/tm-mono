import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";

type Kunde = Database["public"]["Tables"]["kunden"]["Row"];
type KundeInsert = Database["public"]["Tables"]["kunden"]["Insert"];
type KundeUpdate = Database["public"]["Tables"]["kunden"]["Update"];

// Fetch all kunden
export const useKunden = (opts?: { enabled?: boolean }) => {
  const { activeCompanyId } = useActiveCompany();

  return useQuery({
    queryKey: ["kunden", activeCompanyId],
    enabled: (opts?.enabled ?? true) && !!activeCompanyId,
    queryFn: async () => {
      if (!activeCompanyId) return [];

      const { data, error } = await supabase
        .from("kunden")
        .select(`
          *,
          clients(count)
        `)
        .eq("unternehmen_id", activeCompanyId)
        .order("name");

      if (error) {
        toast.error("Fehler beim Laden der Kunden", {
          description: error.message,
        });
        throw error;
      }

      return data;
    },
  });
};

// Fetch single kunde
export const useKunde = (id: string) => {
  return useQuery({
    queryKey: ["kunden", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kunden")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Fehler beim Laden des Kunden", {
          description: error.message,
        });
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
};

// Create kunde
export const useCreateKunde = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useActiveCompany();

  return useMutation({
    mutationFn: async (kunde: KundeInsert) => {
      if (!activeCompanyId) {
        throw new Error("Kein ERP-Unternehmen ausgewählt");
      }

      const { data, error } = await supabase
        .from("kunden")
        .insert({
          ...kunde,
          unternehmen_id: activeCompanyId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kunden"] });
      toast.success("Kunde erfolgreich erstellt");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Erstellen", {
        description: error.message,
      });
    },
  });
};

// Update kunde
export const useUpdateKunde = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useActiveCompany();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: KundeUpdate }) => {
      if (!activeCompanyId) {
        throw new Error("Kein ERP-Unternehmen ausgewählt");
      }

      const { data, error } = await supabase
        .from("kunden")
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
      queryClient.invalidateQueries({ queryKey: ["kunden"] });
      queryClient.invalidateQueries({ queryKey: ["kunden", data.id] });
      toast.success("Kunde erfolgreich aktualisiert");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Aktualisieren", {
        description: error.message,
      });
    },
  });
};

// Delete kunde
export const useDeleteKunde = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("kunden")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kunden"] });
      toast.success("Kunde erfolgreich gelöscht");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Löschen", {
        description: error.message,
      });
    },
  });
};
