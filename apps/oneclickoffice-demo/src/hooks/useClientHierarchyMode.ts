import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";

export type ClientHierarchyMode = "two_level" | "single_level";

/**
 * Liest den Hierarchie-Modus des aktiven Mandanten.
 * Single-Source-of-Truth für UI-Verzweigung.
 */
export function useClientHierarchyMode(unternehmenId?: string) {
  const { activeCompanyId } = useActiveCompany();
  const targetId = unternehmenId ?? activeCompanyId;

  return useQuery({
    queryKey: ["client-hierarchy-mode", targetId],
    queryFn: async (): Promise<ClientHierarchyMode> => {
      if (!targetId) return "two_level";
      const { data, error } = await supabase
        .from("unternehmen")
        .select("client_hierarchy_mode")
        .eq("id", targetId)
        .single();
      if (error) throw error;
      return (data?.client_hierarchy_mode ?? "two_level") as ClientHierarchyMode;
    },
    enabled: !!targetId,
    staleTime: 5 * 60_000,
  });
}

/**
 * Comfort-Hook: returns true when active mandant is in single_level mode.
 * While loading: returns false (safe default, shows 2-level UI).
 */
export function useIsSingleLevel(unternehmenId?: string): boolean {
  const { data } = useClientHierarchyMode(unternehmenId);
  return data === "single_level";
}
