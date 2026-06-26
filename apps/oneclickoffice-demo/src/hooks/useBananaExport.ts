import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BananaExportFilter {
  expense_ids?: string[];
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
  include_already_exported?: boolean;
}

/**
 * Triggert die Edge Function `export-banana` und lädt das resultierende
 * ZIP automatisch im Browser herunter. Die Granularität (per_line_item /
 * per_receipt) wird serverseitig aus `unternehmen.banana_export_granularity`
 * gelesen — d.h. der Toggle in den Einstellungen entscheidet, wie das ZIP
 * aufgebaut ist.
 */
export const useBananaExport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (filter: BananaExportFilter): Promise<{ filename: string; size: number }> => {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) throw new Error("Nicht angemeldet");

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-banana`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filter),
      });

      if (!response.ok) {
        let msg = `Export fehlgeschlagen (${response.status})`;
        try {
          const errBody = await response.json();
          if (errBody?.error) msg = errBody.error;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      const blob = await response.blob();

      // Filename aus Content-Disposition extrahieren oder Fallback
      const cd = response.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename="?([^"]+)"?/);
      const today = new Date().toISOString().slice(0, 10);
      const filename = match?.[1] ?? `oneclick_export_banana_${today}.zip`;

      // Browser-Download triggern
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      return { filename, size: blob.size };
    },
    onSuccess: ({ filename, size }) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["banana-export-counter"] });
      toast.success("Banana-Export bereit", {
        description: `${filename} (${formatBytes(size)}) wurde heruntergeladen.`,
      });
    },
    onError: (error: Error) => {
      toast.error("Banana-Export fehlgeschlagen", {
        description: error.message,
      });
    },
  });
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
