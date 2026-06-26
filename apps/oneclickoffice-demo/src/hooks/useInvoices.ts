import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
type InvoiceInsert = Database["public"]["Tables"]["invoices"]["Insert"];
type InvoiceUpdate = Database["public"]["Tables"]["invoices"]["Update"];

// Fetch all invoices
export const useInvoices = () => {
  const { activeCompanyId } = useActiveCompany();

  return useQuery({
    queryKey: ["invoices", activeCompanyId],
    enabled: !!activeCompanyId,
    queryFn: async () => {
      if (!activeCompanyId) return [];

      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          kunden(name),
          clients(first_name, last_name)
        `)
        .eq("unternehmen_id", activeCompanyId)
        .order("created_at", { ascending: false});

      if (error) {
        toast.error("Fehler beim Laden der Rechnungen", {
          description: error.message,
        });
        throw error;
      }

      // Sanitize data to prevent null/undefined errors
      return data?.map(invoice => ({
        ...invoice,
        subtotal: invoice.subtotal ?? 0,
        vat_amount: invoice.vat_amount ?? 0,
        total: invoice.total ?? 0,
      })) || [];
    },
  });
};

// Fetch single invoice
export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Fehler beim Laden der Rechnung", {
          description: error.message,
        });
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
};

// Create invoice
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useActiveCompany();

  return useMutation({
    mutationFn: async (invoice: InvoiceInsert) => {
      if (!activeCompanyId) {
        throw new Error("Kein ERP-Unternehmen ausgewählt");
      }

      const { data, error } = await supabase
        .from("invoices")
        .insert({
          ...invoice,
          unternehmen_id: activeCompanyId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Rechnung erfolgreich erstellt");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Erstellen", {
        description: error.message,
      });
    },
  });
};

// Update invoice
export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useActiveCompany();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: InvoiceUpdate }) => {
      if (!activeCompanyId) {
        throw new Error("Kein ERP-Unternehmen ausgewählt");
      }

      const { data, error } = await supabase
        .from("invoices")
        .update({
          ...updates,
          unternehmen_id: activeCompanyId,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices", data.id] });
      toast.success("Rechnung erfolgreich aktualisiert");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Aktualisieren", {
        description: error.message,
      });
    },
  });
};

// Delete invoice
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useActiveCompany();

  // Helper function to delete a file from storage given its URL
  const deleteFileFromStorage = async (fileUrl: string, fileType: string) => {
    try {
      // Extract the file path from the URL
      // Format: https://PROJECT.supabase.co/storage/v1/object/public/BUCKET/PATH
      const urlParts = fileUrl.split('/storage/v1/object/public/');
      if (urlParts.length === 2) {
        const [bucket, ...pathParts] = urlParts[1].split('/');
        const filePath = pathParts.join('/');

        const { error: storageError } = await supabase.storage
          .from(bucket)
          .remove([decodeURIComponent(filePath)]);

        if (storageError) {
          // Storage deletion failed, but continue with DB deletion
        }
      }
    } catch {
      // URL parsing failed, skip storage deletion
    }
  };

  return useMutation({
    mutationFn: async (id: string) => {
      if (!activeCompanyId) {
        throw new Error("Kein ERP-Unternehmen ausgewählt");
      }

      // First, get the invoice to find the PDF URLs
      const { data: invoice } = await supabase
        .from("invoices")
        .select("pdf_url, work_report_url")
        .eq("id", id)
        .eq("unternehmen_id", activeCompanyId)
        .single();

      // Delete the invoice PDF file from storage if it exists
      if (invoice?.pdf_url) {
        await deleteFileFromStorage(invoice.pdf_url, 'invoice PDF');
      }

      // Delete the work report PDF file from storage if it exists
      if (invoice?.work_report_url) {
        await deleteFileFromStorage(invoice.work_report_url, 'work report PDF');
      }

      // Reset linked time entries (set unbilled again)
      const { error: timeUpdateError } = await supabase
        .from("time_entries")
        .update({
          invoice_id: null,
          is_billed: false,
        })
        .eq("invoice_id", id)
        .eq("unternehmen_id", activeCompanyId);

      if (timeUpdateError) {
        throw timeUpdateError;
      }

      // Delete the invoice from database
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", id)
        .eq("unternehmen_id", activeCompanyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["time_entries"] });
      queryClient.invalidateQueries({ queryKey: ["unbilled_time_entries"] });
      queryClient.invalidateQueries({ queryKey: ["invoice_employee_map"] });
      toast.success("Rechnung, Arbeitsrapport, PDFs und Verknüpfungen erfolgreich gelöscht");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Löschen", {
        description: error.message,
      });
    },
  });
};
