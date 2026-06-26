import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExpenseExportFilter {
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
}

/**
 * Triggert die Edge Function `export-expenses` und laedt das resultierende
 * ZIP (Buchungstabelle + Beleg-Bilder, eine Zeile pro Kategorie je Beleg)
 * im Browser herunter. Non-Banana-Modus.
 */
export const useExpenseExport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      filter: ExpenseExportFilter,
    ): Promise<{ filename: string; size: number }> => {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) throw new Error("Nicht angemeldet");

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-expenses`;
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
      const cd = response.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename="?([^"]+)"?/);
      const today = new Date().toISOString().slice(0, 10);
      const filename = match?.[1] ?? `spesen_export_${today}.zip`;

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
      toast.success("Buchhaltungs-Export bereit", {
        description: `${filename} (${formatBytes(size)}) wurde heruntergeladen.`,
      });
    },
    onError: (error: Error) => {
      toast.error("Buchhaltungs-Export fehlgeschlagen", {
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
