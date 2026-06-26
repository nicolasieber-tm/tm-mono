import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";

export type BananaMapping =
  Database["public"]["Tables"]["banana_account_mappings"]["Row"];

type BananaMappingUpdate =
  Database["public"]["Tables"]["banana_account_mappings"]["Update"];

const QUERY_KEY = "banana-mappings";

export const useBananaMappings = () => {
  const { activeCompanyId } = useActiveCompany();

  return useQuery({
    queryKey: [QUERY_KEY, activeCompanyId],
    enabled: !!activeCompanyId,
    queryFn: async (): Promise<BananaMapping[]> => {
      const { data, error } = await supabase
        .from("banana_account_mappings")
        .select("*")
        .order("category_label", { ascending: true });

      if (error) {
        toast.error("Fehler beim Laden der Banana-Mappings", {
          description: error.message,
        });
        throw error;
      }

      return data ?? [];
    },
  });
};

export const useBananaMapping = (categoryKey: string) => {
  const { activeCompanyId } = useActiveCompany();

  return useQuery({
    queryKey: [QUERY_KEY, activeCompanyId, categoryKey],
    enabled: !!activeCompanyId && !!categoryKey,
    queryFn: async (): Promise<BananaMapping | null> => {
      const { data, error } = await supabase
        .from("banana_account_mappings")
        .select("*")
        .eq("category_key", categoryKey)
        .maybeSingle();

      if (error) {
        toast.error("Fehler beim Laden des Mappings", {
          description: error.message,
        });
        throw error;
      }

      return data;
    },
  });
};

type UpdatePayload = {
  id: string;
  updates: Pick<BananaMappingUpdate, "account_debit" | "vat_code">;
};

export const useUpdateBananaMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: UpdatePayload) => {
      const { data, error } = await supabase
        .from("banana_account_mappings")
        .update({
          account_debit: updates.account_debit,
          vat_code: updates.vat_code,
          is_default: false,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Mapping aktualisiert");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Speichern", {
        description: error.message,
      });
    },
  });
};

export const useResetBananaMapping = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useActiveCompany();

  return useMutation({
    mutationFn: async (categoryKey: string) => {
      if (!activeCompanyId) {
        throw new Error("Kein ERP-Unternehmen ausgewählt");
      }

      const { data, error } = await supabase.rpc("reset_banana_mapping", {
        p_unternehmen_id: activeCompanyId,
        p_category_key: categoryKey,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Mapping auf Default zurückgesetzt");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Zurücksetzen", {
        description: error.message,
      });
    },
  });
};
