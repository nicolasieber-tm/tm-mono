import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";

export type BananaExportCounter =
  Database["public"]["Tables"]["banana_export_counters"]["Row"];

const QUERY_KEY = "banana-export-counter";

/**
 * Liest den aktuellen Stand des ExternalReference-Counters fuer das
 * aktive Unternehmen. Reine Read-Query — der Counter wird ausschliesslich
 * durch die Edge Function `export-banana` (Phase 2) ueber die SQL-Funktion
 * `next_banana_external_ref()` inkrementiert.
 */
export const usePeekBananaCounter = () => {
  const { activeCompanyId } = useActiveCompany();

  return useQuery({
    queryKey: [QUERY_KEY, activeCompanyId],
    enabled: !!activeCompanyId,
    queryFn: async (): Promise<BananaExportCounter | null> => {
      const { data, error } = await supabase
        .from("banana_export_counters")
        .select("*")
        .maybeSingle();

      if (error) {
        toast.error("Fehler beim Laden des Banana-Counters", {
          description: error.message,
        });
        throw error;
      }

      return data;
    },
  });
};
