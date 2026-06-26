import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type BananaPaymentMethod =
  | "bar"
  | "bank"
  | "kreditkarte"
  | "privat_ausgelegt"
  | "kreditor";

export type BananaExportGranularity = "per_line_item" | "per_receipt";

export type UnternehmenBananaSettings = Pick<
  Database["public"]["Tables"]["unternehmen"]["Row"],
  | "id"
  | "is_mwst_pflichtig"
  | "banana_default_payment_method"
  | "banana_export_granularity"
  | "banana_export_enabled"
>;

const QUERY_KEY = "unternehmen-banana-settings";
const SELECT_COLS =
  "id, is_mwst_pflichtig, banana_default_payment_method, banana_export_granularity, banana_export_enabled";

export const useUnternehmenBananaSettings = () => {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async (): Promise<UnternehmenBananaSettings> => {
      const { data, error } = await supabase
        .from("unternehmen")
        .select(SELECT_COLS)
        .single();

      if (error) {
        toast.error("Fehler beim Laden der Banana-Einstellungen", {
          description: error.message,
        });
        throw error;
      }

      return data as UnternehmenBananaSettings;
    },
  });
};

type UpdatePayload = {
  id: string;
  is_mwst_pflichtig?: boolean;
  banana_default_payment_method?: BananaPaymentMethod;
  banana_export_granularity?: BananaExportGranularity;
  banana_export_enabled?: boolean;
};

export const useUpdateUnternehmenBananaSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdatePayload) => {
      const { data, error } = await supabase
        .from("unternehmen")
        .update(updates)
        .eq("id", id)
        .select(SELECT_COLS)
        .single();

      if (error) throw error;
      return data as UnternehmenBananaSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["unternehmen"] });
      toast.success("Einstellungen gespeichert");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Speichern der Einstellungen", {
        description: error.message,
      });
    },
  });
};
