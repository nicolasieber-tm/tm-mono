import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ClientNoteStats = {
  count: number;
  lastCreatedAt: string | null;
};

/**
 * Aggregierte Notiz-Statistiken pro Klient (nur nicht-soft-deleted).
 * RLS filtert automatisch auf Unternehmen + Visibility-Modus.
 * Nutzt Single-Query + Client-side Group-By — genügt bei < 5k Notizen.
 */
export const useClientNoteStats = () => {
  return useQuery({
    queryKey: ["client-note-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_notes")
        .select("client_id, created_at")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const statsByClient: Record<string, ClientNoteStats> = {};
      for (const row of data ?? []) {
        const existing = statsByClient[row.client_id];
        if (!existing) {
          statsByClient[row.client_id] = {
            count: 1,
            lastCreatedAt: row.created_at,
          };
        } else {
          existing.count += 1;
          // `order desc` garantiert, dass das erste gesehene das neueste ist
        }
      }
      return statsByClient;
    },
    staleTime: 30_000,
  });
};
