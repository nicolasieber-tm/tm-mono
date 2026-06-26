import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Whether the currently authenticated user has the 'admin' role in the
 * user_roles table. Defaults to false while loading or when no admin row
 * exists. Used to gate admin-only UI (e.g. the System-Status link).
 */
export function useIsAdmin() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["user-role", "admin", user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user,
  });

  return { isAdmin: query.data ?? false, isLoading: query.isLoading };
}
