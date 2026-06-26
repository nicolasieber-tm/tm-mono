import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type ClientNote = Database["public"]["Tables"]["client_notes"]["Row"];

// Fetch all (non-deleted) notes for one client, sorted newest first.
// RLS filters visibility (alle_mitarbeiter / nur_autor); soft-deleted rows are
// filtered client-side so PostgREST RETURNING doesn't reject soft-delete UPDATEs.
export const useClientNotes = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ["client-notes", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      if (!clientId) return [];

      const { data, error } = await supabase
        .from("client_notes")
        .select("*")
        .eq("client_id", clientId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Fehler beim Laden der Notizen", {
          description: error.message,
        });
        throw error;
      }

      return data as ClientNote[];
    },
  });
};

// Fetch all (non-deleted) notes for a Kunde (company) — used in single_level mode.
// Notes are owned by company_id (XOR with client_id).
export const useCompanyNotes = (companyId: string | undefined) => {
  return useQuery({
    queryKey: ["client-notes", "by-company", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];

      const { data, error } = await supabase
        .from("client_notes")
        .select("*")
        .eq("company_id", companyId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Fehler beim Laden der Notizen", {
          description: error.message,
        });
        throw error;
      }

      return data as ClientNote[];
    },
  });
};

// Create a new client note. author_id is set from the authenticated user.
// XOR constraint: pass either clientId OR companyId (not both).
// - two_level mode: clientId required, companyId omitted/null
// - single_level mode: companyId required, clientId omitted/null
export const useCreateClientNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      companyId,
      content,
      sessionDate,
    }: {
      clientId?: string | null;
      companyId?: string | null;
      content: string;
      sessionDate?: string | null;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Nicht eingeloggt");
      }

      const { data, error } = await supabase
        .from("client_notes")
        .insert({
          client_id: clientId ?? null,
          company_id: companyId ?? null,
          author_id: user.id,
          content,
          session_date: sessionDate ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ClientNote;
    },
    onSuccess: (data) => {
      if (data.client_id) {
        queryClient.invalidateQueries({ queryKey: ["client-notes", data.client_id] });
      }
      if (data.company_id) {
        queryClient.invalidateQueries({ queryKey: ["client-notes", "by-company", data.company_id] });
      }
      toast.success("Notiz gespeichert");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Speichern der Notiz", {
        description: error.message,
      });
    },
  });
};

// Update an existing note. Only the provided fields are sent.
// IMPORTANT: never send author_id (column-level-GRANT blocks it in the DB).
// Pass clientId OR companyId (matching the note's ownership) for cache invalidation.
export const useUpdateClientNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      clientId,
      companyId,
      content,
      sessionDate,
    }: {
      id: string;
      clientId?: string | null;
      companyId?: string | null;
      content?: string;
      sessionDate?: string | null;
    }) => {
      const updates: {
        content?: string;
        session_date?: string | null;
      } = {};
      if (content !== undefined) updates.content = content;
      if (sessionDate !== undefined) updates.session_date = sessionDate;

      const { data, error } = await supabase
        .from("client_notes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data: data as ClientNote, clientId: clientId ?? null, companyId: companyId ?? null };
    },
    onSuccess: ({ clientId, companyId }) => {
      if (clientId) {
        queryClient.invalidateQueries({ queryKey: ["client-notes", clientId] });
      }
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: ["client-notes", "by-company", companyId] });
      }
      toast.success("Notiz aktualisiert");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Aktualisieren der Notiz", {
        description: error.message,
      });
    },
  });
};

// Soft-delete a note by setting deleted_at. Hard-delete is blocked by RLS.
// Pass clientId OR companyId (matching the note's ownership) for cache invalidation.
export const useSoftDeleteClientNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      clientId,
      companyId,
    }: {
      id: string;
      clientId?: string | null;
      companyId?: string | null;
    }) => {
      const { error } = await supabase
        .from("client_notes")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      return { id, clientId: clientId ?? null, companyId: companyId ?? null };
    },
    onSuccess: ({ clientId, companyId }) => {
      if (clientId) {
        queryClient.invalidateQueries({ queryKey: ["client-notes", clientId] });
      }
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: ["client-notes", "by-company", companyId] });
      }
      toast.success("Notiz gelöscht");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Löschen der Notiz", {
        description: error.message,
      });
    },
  });
};

// Fetch single note by id (für das Aktivitäts-Detail-Overlay).
// Eigener Query-Key; nach Mutationen via invalidateQueries(["client-notes"]) (Prefix) frisch.
export const useClientNote = (id: string | undefined) => {
  return useQuery({
    queryKey: ["client-notes", "single", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_notes")
        .select("*")
        .eq("id", id!)
        .single();

      if (error) {
        toast.error("Fehler beim Laden der Notiz", { description: error.message });
        throw error;
      }

      return data as ClientNote;
    },
  });
};
