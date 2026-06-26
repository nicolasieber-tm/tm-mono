import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { LeafStyle } from "@/components/expenses/types";

/**
 * Reads the current user's leaf-style preference from employees.expense_view_preference.
 * Falls back to 'summary' if missing.
 */
export function useExpenseViewPreference() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["expense-view-preference", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<LeafStyle> => {
      if (!user?.id) return "summary";
      const { data, error } = await supabase
        .from("employees")
        .select("expense_view_preference")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      const raw = (data as { expense_view_preference?: string } | null)?.expense_view_preference;
      return raw === "gallery" ? "gallery" : "summary";
    },
  });
}

export function useUpdateExpenseViewPreference() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (style: LeafStyle) => {
      if (!user?.id) throw new Error("Kein Benutzer angemeldet");
      const { error } = await supabase
        .from("employees")
        .update({ expense_view_preference: style })
        .eq("id", user.id);
      if (error) throw error;
      return style;
    },
    onSuccess: (style) => {
      queryClient.setQueryData(["expense-view-preference", user?.id], style);
      toast.success("Einstellung gespeichert");
    },
    onError: (err: Error) => {
      toast.error("Fehler beim Speichern", { description: err.message });
    },
  });
}
