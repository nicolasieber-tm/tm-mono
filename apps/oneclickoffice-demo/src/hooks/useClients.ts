import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";

type Client = Database["public"]["Tables"]["clients"]["Row"];
type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];
type ClientUpdate = Database["public"]["Tables"]["clients"]["Update"];

// Fetch all clients
export const useClients = (opts?: { enabled?: boolean }) => {
  const { activeCompanyId } = useActiveCompany();

  return useQuery({
    queryKey: ["clients", activeCompanyId],
    enabled: (opts?.enabled ?? true) && !!activeCompanyId,
    queryFn: async () => {
      if (!activeCompanyId) return [];

      const { data, error } = await supabase
        .from("clients")
        .select(`
          *,
          kunden(name)
        `)
        .eq("unternehmen_id", activeCompanyId)
        .order("last_name");

      if (error) {
        toast.error("Fehler beim Laden der Klienten", {
          description: error.message,
        });
        throw error;
      }

      return data;
    },
  });
};

// Fetch single client
export const useClient = (id: string) => {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Fehler beim Laden des Klienten", {
          description: error.message,
        });
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
};

// Create client
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useActiveCompany();

  return useMutation({
    mutationFn: async (client: ClientInsert) => {
      if (!activeCompanyId) {
        throw new Error("Kein ERP-Unternehmen ausgewählt");
      }

      const insertData = {
        company_id: client.company_id,
        first_name: client.first_name,
        last_name: client.last_name,
        address: client.address || null,
        zip: client.zip || null,
        city: client.city || null,
        birthdate: client.birthdate || null,
        notes: client.notes || null,
        salutation: client.salutation || null,
        contact_person: client.contact_person || null,
        contact_person_first_name: client.contact_person_first_name || null,
        contact_person_last_name: client.contact_person_last_name || null,
        contact_person_salutation: client.contact_person_salutation || null,
        unternehmen_id: activeCompanyId,
      };

      const { data, error } = await supabase
        .from("clients")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["kunden"] });
      toast.success("Klient erfolgreich erstellt");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Erstellen", {
        description: error.message,
      });
    },
  });
};

// Update client
export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useActiveCompany();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ClientUpdate }) => {
      if (!activeCompanyId) {
        throw new Error("Kein ERP-Unternehmen ausgewählt");
      }

      const updateData = {
        company_id: updates.company_id,
        first_name: updates.first_name,
        last_name: updates.last_name,
        address: updates.address || null,
        zip: updates.zip || null,
        city: updates.city || null,
        birthdate: updates.birthdate || null,
        notes: updates.notes || null,
        salutation: updates.salutation || null,
        contact_person: updates.contact_person || null,
        contact_person_first_name: updates.contact_person_first_name || null,
        contact_person_last_name: updates.contact_person_last_name || null,
        contact_person_salutation: updates.contact_person_salutation || null,
        unternehmen_id: activeCompanyId,
      };

      const { data, error } = await supabase
        .from("clients")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients", data.id] });
      queryClient.invalidateQueries({ queryKey: ["kunden"] });
      toast.success("Klient erfolgreich aktualisiert");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Aktualisieren", {
        description: error.message,
      });
    },
  });
};

// Delete client
export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["kunden"] });
      toast.success("Klient erfolgreich gelöscht");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Löschen", {
        description: error.message,
      });
    },
  });
};
