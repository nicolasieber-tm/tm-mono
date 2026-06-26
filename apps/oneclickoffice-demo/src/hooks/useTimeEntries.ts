import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";

type TimeEntry = Database["public"]["Tables"]["time_entries"]["Row"];
type TimeEntryInsert = Database["public"]["Tables"]["time_entries"]["Insert"];
type TimeEntryUpdate = Database["public"]["Tables"]["time_entries"]["Update"];

// Fetch all time entries
export const useTimeEntries = () => {
  const { activeCompanyId } = useActiveCompany();

  return useQuery({
    queryKey: ["time_entries", activeCompanyId],
    enabled: !!activeCompanyId,
    queryFn: async () => {
      if (!activeCompanyId) return [];

      const { data, error } = await supabase
        .from("time_entries")
        .select(`
          *,
          kunden(name),
          clients(first_name, last_name),
          employees(first_name, last_name),
          invoices(invoice_number, created_at)
        `)
        .eq("unternehmen_id", activeCompanyId)
        .order("date", { ascending: false });

      if (error) {
        toast.error("Fehler beim Laden der Zeiteinträge", {
          description: error.message,
        });
        throw error;
      }

      return data;
    },
  });
};

// Fetch single time entry
export const useTimeEntry = (id: string) => {
  return useQuery({
    queryKey: ["time_entries", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Fehler beim Laden des Zeiteintrags", {
          description: error.message,
        });
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
};

// Create time entry
export const useCreateTimeEntry = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useActiveCompany();

  return useMutation({
    mutationFn: async (timeEntry: TimeEntryInsert) => {
      if (!activeCompanyId) {
        throw new Error("Kein ERP-Unternehmen ausgewählt");
      }

      const { data, error } = await supabase
        .from("time_entries")
        .insert({
          ...timeEntry,
          unternehmen_id: activeCompanyId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time_entries"] });
      toast.success("Zeiteintrag erfolgreich erstellt");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Erstellen", {
        description: error.message,
      });
    },
  });
};

// Update time entry
export const useUpdateTimeEntry = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useActiveCompany();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TimeEntryUpdate }) => {
      if (!activeCompanyId) {
        throw new Error("Kein ERP-Unternehmen ausgewählt");
      }

      const { data, error } = await supabase
        .from("time_entries")
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
      queryClient.invalidateQueries({ queryKey: ["time_entries"] });
      queryClient.invalidateQueries({ queryKey: ["time_entries", data.id] });
      toast.success("Zeiteintrag erfolgreich aktualisiert");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Aktualisieren", {
        description: error.message,
      });
    },
  });
};

// Delete time entry
export const useDeleteTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("time_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time_entries"] });
      toast.success("Zeiteintrag erfolgreich gelöscht");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Löschen", {
        description: error.message,
      });
    },
  });
};
