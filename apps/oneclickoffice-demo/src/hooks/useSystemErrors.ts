import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type SystemError = {
  id: string;
  error_type: string;
  severity: 'critical' | 'warning' | 'info';
  error_message: string;
  context: Record<string, unknown> | null;
  notified: boolean;
  resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  unternehmen_id: string | null;
  unternehmen: { company_name: string | null } | null;
};

export const useSystemErrors = (filter?: { resolved?: boolean; severity?: string }) => {
  return useQuery({
    queryKey: ['system-errors', filter],
    queryFn: async () => {
      let query = supabase
        .from('system_error_log')
        .select('*, unternehmen(company_name)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter?.resolved !== undefined) {
        query = query.eq('resolved', filter.resolved);
      }
      if (filter?.severity) {
        query = query.eq('severity', filter.severity);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as SystemError[];
    },
  });
};

/**
 * Returns the count of unresolved critical errors.
 * Polls every 60 seconds for near-realtime updates without being wasteful.
 * Used by the dashboard banner and sidebar badge.
 */
export const useUnresolvedCriticalCount = () => {
  return useQuery({
    queryKey: ['system-errors-critical-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('system_error_log')
        .select('*', { count: 'exact', head: true })
        .eq('severity', 'critical')
        .eq('resolved', false);
      if (error) return 0;
      return count ?? 0;
    },
    refetchInterval: 60_000,
  });
};

export const useMarkErrorResolved = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (errorId: string) => {
      const { error } = await supabase
        .from('system_error_log')
        .update({
          resolved: true,
          resolved_by: user?.id ?? null,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', errorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-errors'] });
      queryClient.invalidateQueries({ queryKey: ['system-errors-critical-count'] });
      toast.success('Fehler als behoben markiert');
    },
    onError: (err: Error) => {
      toast.error('Fehler beim Markieren', { description: err.message });
    },
  });
};
