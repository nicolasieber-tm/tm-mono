import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Pencil, Trash2, Loader2, FileText, ExternalLink, Zap, FileStack, ChevronRight, ChevronDown, Calendar, Info } from "lucide-react";
import { useInvoices, useCreateInvoice, useUpdateInvoice, useDeleteInvoice } from "@/hooks/useInvoices";
import { useKunden } from "@/hooks/useKunden";
import { useClients } from "@/hooks/useClients";
import { useEmployees } from "@/hooks/useEmployees";
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";
import { toast } from "sonner";
import { generateSwissQRInvoicePDF } from "@/utils/swissQRBillGenerator";
import { isDemoMode } from "@/hooks/useDemoMode";
import { createDemoInvoicePreviewUrl, type DemoInvoicePreviewInput } from "@/components/demo/invoicePreview";
import HtmlInvoiceGenerator from "@/components/invoices/HtmlInvoiceGenerator";
import HierarchicalInvoiceList from "@/components/invoices/HierarchicalInvoiceList";
import { useClientHierarchyMode } from "@/hooks/useClientHierarchyMode";
import { formatFormalSalutation, formatSalutationLetter } from "@/utils/salutation";
import { resolveContactFirstName, resolveContactLastName, resolveContactFullName } from "@/utils/contactPerson";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
type InvoiceTemplate = Database["public"]["Tables"]["invoice_templates"]["Row"];
type HtmlInvoiceTemplate = Database["public"]["Tables"]["html_invoice_templates"]["Row"];
type ClientWithRelations = Database["public"]["Tables"]["clients"]["Row"] & {
  kunden?: { name: string } | null;
  email?: string;
};
type InvoiceWithRelations = Invoice & {
  kunden?: { name: string } | null;
  clients?: { first_name: string; last_name: string } | null;
  companies?: { id: string; name: string } | null;
};
type TimeEntryWithRelations = Database["public"]["Tables"]["time_entries"]["Row"] & {
  kunden?: { name: string } | null;
  clients?: { first_name: string; last_name: string } | null;
  employees?: { first_name: string; last_name: string; hourly_rate?: number } | null;
  hourly_rate?: number;
};

const getCurrentMonthValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const getCurrentMonthNumber = () => {
  return String(new Date().getMonth() + 1).padStart(2, "0");
};

const getCurrentYearValue = () => {
  return String(new Date().getFullYear());
};

// Invoice webhook intentionally disabled to avoid n8n errors (spesen webhook remains active elsewhere)
const N8N_WEBHOOK_URL = "";
const DEFAULT_INVOICE_TEMPLATE_STORAGE_KEY_PREFIX =
  "oneclick-office-default-invoice-template-id:";

// Company info is now loaded dynamically from database based on company_id

const Rechnungen = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generatingInvoices, setGeneratingInvoices] = useState(false);
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [htmlTemplates, setHtmlTemplates] = useState<HtmlInvoiceTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedInvoiceMonth, setSelectedInvoiceMonth] = useState<string>(getCurrentMonthValue);
  const [selectedGenerateClientId, setSelectedGenerateClientId] = useState<string>("all");
  const [listFilterYear, setListFilterYear] = useState<string>(getCurrentYearValue());
  const [listFilterMonth, setListFilterMonth] = useState<string>(getCurrentMonthNumber());
  const [listFilterClientId, setListFilterClientId] = useState<string>("all");
  const [listFilterEmployeeId, setListFilterEmployeeId] = useState<string>("all");
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isInvoiceSearchOpen, setIsInvoiceSearchOpen] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [monthSearchQuery, setMonthSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [focusedInvoiceId, setFocusedInvoiceId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    company_id: "",
    client_id: "",
    invoice_number: "",
    period_start: "",
    period_end: "",
    subtotal: "",
    vat_amount: "",
    total: "",
    status: "draft" as "draft" | "sent" | "paid",
    pdf_url: "",
  });

  const { user } = useAuth();
  const { activeCompanyId, activeCompany } = useActiveCompany();
  const { data: hierarchyMode = "two_level" } = useClientHierarchyMode();
  const { data: invoices, isLoading } = useInvoices();
  const { data: companies } = useKunden();
  const isSingle = hierarchyMode === "single_level";
  const { data: clients } = useClients({ enabled: !isSingle });
  const { data: employees } = useEmployees();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();
  const queryClient = useQueryClient();
  const { data: unbilledEntries = [], isLoading: isLoadingUnbilledEntries } = useQuery({
    queryKey: ["unbilled_time_entries", activeCompanyId],
    enabled: !!activeCompanyId,
    queryFn: async () => {
      if (!activeCompanyId) return [];

      const { data, error } = await supabase
        .from("unbilled_time_entries")
        .select("*")
        .eq("unternehmen_id", activeCompanyId);

      if (error) {
        toast.error("Fehler beim Laden der offenen Zeiteinträge", {
          description: error.message,
        });
        throw error;
      }

      return data || [];
    },
  });

  // Map invoice IDs to employee IDs via billed time_entries
  const { data: invoiceEmployeeMap = {} } = useQuery({
    queryKey: ["invoice_employee_map", activeCompanyId],
    enabled: !!activeCompanyId,
    queryFn: async () => {
      if (!activeCompanyId) return {};

      const { data, error } = await supabase
        .from("time_entries")
        .select("invoice_id, employee_id")
        .eq("unternehmen_id", activeCompanyId)
        .eq("is_billed", true)
        .not("invoice_id", "is", null);

      if (error) {
        return {};
      }

      // Build a map: invoice_id -> Set of employee_ids
      const map: Record<string, Set<string>> = {};
      data?.forEach((entry) => {
        if (!entry.invoice_id) return;
        if (!map[entry.invoice_id]) {
          map[entry.invoice_id] = new Set();
        }
        map[entry.invoice_id].add(entry.employee_id);
      });

      // Convert sets to arrays for easier use
      const result: Record<string, string[]> = {};
      Object.entries(map).forEach(([invoiceId, employeeIds]) => {
        result[invoiceId] = Array.from(employeeIds);
      });
      return result;
    },
  });

  const persistDefaultInvoiceTemplate = useCallback(
    (templateId: string) => {
      if (!activeCompanyId) return;
      const perCompanyKey = `${DEFAULT_INVOICE_TEMPLATE_STORAGE_KEY_PREFIX}${activeCompanyId}`;
      localStorage.setItem(perCompanyKey, templateId);
      localStorage.setItem("default_invoice_template", templateId);
    },
    [activeCompanyId]
  );

  // Fetch invoice templates
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!user || !activeCompanyId) return;

      // Fetch PDF-based templates (all templates - no user filter)
      const { data: pdfData, error: pdfError } = await supabase
        .from('invoice_templates')
        .select('*')
        .eq('unternehmen_id', activeCompanyId)
        .order('created_at', { ascending: false });

      if (!pdfError) {
        setTemplates(pdfData || []);
      }

      // Fetch HTML-based templates (all templates - no user filter)
      const { data: htmlData, error: htmlError } = await supabase
        .from('invoice_templates')
        .select('*')
        .eq('unternehmen_id', activeCompanyId)
        .order('created_at', { ascending: false });

      if (!htmlError) {
        const nextHtmlTemplates = htmlData || [];
        setHtmlTemplates(nextHtmlTemplates);

        const perCompanyKey = `${DEFAULT_INVOICE_TEMPLATE_STORAGE_KEY_PREFIX}${activeCompanyId}`;
        const savedTemplateId =
          activeCompany?.default_invoice_template_id ||
          localStorage.getItem(perCompanyKey) ||
          localStorage.getItem("default_invoice_template") ||
          "";

        const hasSavedTemplate = !!savedTemplateId && nextHtmlTemplates.some((t) => t.id === savedTemplateId);
        if (hasSavedTemplate) {
          setSelectedTemplateId(savedTemplateId as string);
          persistDefaultInvoiceTemplate(savedTemplateId);
          return;
        }

        if (nextHtmlTemplates.length === 1) {
          const onlyTemplateId = nextHtmlTemplates[0].id;
          setSelectedTemplateId(onlyTemplateId);
          if (!savedTemplateId) {
            persistDefaultInvoiceTemplate(onlyTemplateId);
          }
          return;
        }

        setSelectedTemplateId("");
        persistDefaultInvoiceTemplate("");
      }
    };

    fetchTemplates();
  }, [user, activeCompanyId, activeCompany, persistDefaultInvoiceTemplate]);

  // Generate month options (January to December for the current year)
  const invoiceMonthOptions = React.useMemo(() => {
    const year = new Date().getFullYear();
    const options = [];
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const date = new Date(year, monthIndex, 1);
      const value = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString("de-DE", { month: "long" });
      options.push({ value, label });
    }
    return options;
  }, []);

  const listMonthOptions = React.useMemo(() => {
    const options = [];
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const date = new Date(2000, monthIndex, 1);
      const value = String(monthIndex + 1).padStart(2, "0");
      const label = date.toLocaleDateString("de-DE", { month: "long" });
      options.push({ value, label });
    }
    return options;
  }, []);

  const listYearOptions = React.useMemo(() => {
    const years = new Set<string>();
    years.add(getCurrentYearValue());
    invoices?.forEach((invoice) => {
      const dateSource = invoice.period_start || invoice.created_at;
      if (!dateSource) return;
      const date = new Date(dateSource);
      if (isNaN(date.getTime())) return;
      years.add(String(date.getFullYear()));
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [invoices]);

  const selectedMonthLabel = React.useMemo(() => {
    if (selectedInvoiceMonth === "all") return "alle Monate";
    const monthLabel = invoiceMonthOptions.find((option) => option.value === selectedInvoiceMonth)?.label;
    return monthLabel || selectedInvoiceMonth;
  }, [selectedInvoiceMonth, invoiceMonthOptions]);

  const listFilterMonthLabel = React.useMemo(() => {
    if (listFilterMonth === "all") return "Alle Monate";
    const monthLabel = listMonthOptions.find((option) => option.value === listFilterMonth)?.label;
    return monthLabel || listFilterMonth;
  }, [listFilterMonth, listMonthOptions]);

  const listFilterYearLabel = React.useMemo(() => {
    if (listFilterYear === "all") return "Alle Jahre";
    return listFilterYear;
  }, [listFilterYear]);

  const listFilterClientLabel = React.useMemo(() => {
    if (listFilterClientId === "all") return "Alle Klienten";
    const client = clients?.find((item) => item.id === listFilterClientId);
    if (!client) return "Ausgewählter Klient";
    const clientName = [client.first_name, client.last_name].filter(Boolean).join(" ").trim();
    const companyName = (client as ClientWithRelations).kunden?.name;
    const baseName = clientName || (client as ClientWithRelations).email || "Klient";
    return companyName ? `${baseName} · ${companyName}` : baseName;
  }, [clients, listFilterClientId]);

  const listFilterEmployeeLabel = React.useMemo(() => {
    if (listFilterEmployeeId === "all") return "Alle Mitarbeitende";
    const employee = employees?.find((item) => item.id === listFilterEmployeeId);
    if (!employee) return "Ausgewählter Mitarbeiter";
    return [employee.first_name, employee.last_name].filter(Boolean).join(" ").trim() || "Mitarbeiter";
  }, [employees, listFilterEmployeeId]);

  const selectedGenerateClientLabel = React.useMemo(() => {
    if (selectedGenerateClientId === "all") return "alle Klienten";
    const client = clients?.find((item) => item.id === selectedGenerateClientId);
    if (!client) return "ausgewählter Klient";
    const clientName = [client.first_name, client.last_name].filter(Boolean).join(" ").trim();
    const companyName = (client as ClientWithRelations).kunden?.name;
    const baseName = clientName || (client as ClientWithRelations).email || "Klient";
    return companyName ? `${baseName} · ${companyName}` : baseName;
  }, [clients, selectedGenerateClientId]);

  const generationFilterLabel = React.useMemo(() => {
    if (selectedGenerateClientId === "all") return selectedMonthLabel;
    return `${selectedMonthLabel} · ${selectedGenerateClientLabel}`;
  }, [selectedGenerateClientId, selectedGenerateClientLabel, selectedMonthLabel]);

  useEffect(() => {
    if (!activeCompanyId) {
      setSelectedGenerateClientId("all");
      return;
    }
    if (selectedGenerateClientId === "all") return;
    const hasClient = clients?.some((client) => client.id === selectedGenerateClientId);
    if (!hasClient) {
      setSelectedGenerateClientId("all");
    }
  }, [activeCompanyId, clients, selectedGenerateClientId]);

  useEffect(() => {
    if (!activeCompanyId) {
      setListFilterClientId("all");
      return;
    }
    if (listFilterClientId === "all") return;
    const hasClient = clients?.some((client) => client.id === listFilterClientId);
    if (!hasClient) {
      setListFilterClientId("all");
    }
  }, [activeCompanyId, clients, listFilterClientId]);

  const { openEntriesCount, invoicesToGenerateCount } = React.useMemo(() => {
    const entries = unbilledEntries || [];

    const monthFilteredEntries =
      selectedInvoiceMonth === "all"
        ? entries
        : entries.filter((entry: TimeEntryWithRelations) => {
            if (!entry?.date) return false;
            const entryDate = new Date(entry.date);
            if (isNaN(entryDate.getTime())) return false;

            const [selectedYear, selectedMonth] = selectedInvoiceMonth.split("-").map(Number);
            return (
              entryDate.getFullYear() === selectedYear &&
              entryDate.getMonth() + 1 === selectedMonth
            );
          });

    const clientFilteredEntries =
      selectedGenerateClientId === "all"
        ? monthFilteredEntries
        : monthFilteredEntries.filter((entry: TimeEntryWithRelations) => entry.client_id === selectedGenerateClientId);

    const invoiceGroups = new Set(
      clientFilteredEntries.map(
        (entry: TimeEntryWithRelations) => `${entry.company_id || "no-company"}-${entry.client_id || "no-client"}`
      )
    );

    return {
      openEntriesCount: clientFilteredEntries.length,
      invoicesToGenerateCount: invoiceGroups.size,
    };
  }, [selectedInvoiceMonth, selectedGenerateClientId, unbilledEntries]);

  // Filter clients by selected company
  const filteredClients = clients?.filter(
    (client) => client.company_id === formData.company_id
  );

  const resetForm = () => {
    setFormData({
      company_id: "",
      client_id: "",
      invoice_number: "",
      period_start: "",
      period_end: "",
      subtotal: "",
      vat_amount: "",
      total: "",
      status: "draft",
      pdf_url: "",
    });
    setSelectedInvoice(null);
    setPdfFile(null);
  };

  const uploadPdf = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("INVOICES")
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("INVOICES")
        .getPublicUrl(fileName);

      return publicUrl;
    } catch {
      toast.error("Fehler beim Hochladen der Rechnung");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const sendToWebhook = async (pdfUrl: string, invoiceData: { invoice_number: string; company_id: string | null; client_id: string; total: number; status: string }) => {
    if (!N8N_WEBHOOK_URL) return;

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdf_url: pdfUrl,
          invoice_number: invoiceData.invoice_number,
          company_id: invoiceData.company_id,
          client_id: invoiceData.client_id,
          total: invoiceData.total,
          status: invoiceData.status,
          uploaded_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Webhook-Aufruf fehlgeschlagen");
      }
    } catch {
      toast.error("Fehler beim Senden an Webhook");
    }
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(formData.subtotal) || 0;
    const vatAmount = parseFloat(formData.vat_amount) || 0;
    const total = subtotal + vatAmount;
    setFormData({ ...formData, total: total.toFixed(2) });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompanyId) {
      toast.error("Bitte zuerst ein ERP-Unternehmen auswählen");
      return;
    }

    let pdfUrl = formData.pdf_url;
    if (pdfFile) {
      const uploadedUrl = await uploadPdf(pdfFile);
      if (uploadedUrl) {
        pdfUrl = uploadedUrl;
        // Send to webhook
        await sendToWebhook(uploadedUrl, formData);
      }
    }

    await createInvoice.mutateAsync({
      company_id: formData.company_id,
      client_id: formData.client_id,
      invoice_number: formData.invoice_number,
      period_start: formData.period_start,
      period_end: formData.period_end,
      subtotal: parseFloat(formData.subtotal),
      vat_amount: parseFloat(formData.vat_amount),
      total: parseFloat(formData.total),
      status: formData.status,
      pdf_url: pdfUrl || null,
    });

    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setFormData({
      company_id: invoice.company_id,
      client_id: invoice.client_id,
      invoice_number: invoice.invoice_number,
      period_start: invoice.period_start,
      period_end: invoice.period_end,
      subtotal: invoice.subtotal != null ? invoice.subtotal.toString() : "0",
      vat_amount: invoice.vat_amount != null ? invoice.vat_amount.toString() : "0",
      total: invoice.total != null ? invoice.total.toString() : "0",
      status: invoice.status as "draft" | "sent" | "paid",
      pdf_url: invoice.pdf_url || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    if (!activeCompanyId) {
      toast.error("Bitte zuerst ein ERP-Unternehmen auswählen");
      return;
    }

    let pdfUrl = formData.pdf_url;
    if (pdfFile) {
      const uploadedUrl = await uploadPdf(pdfFile);
      if (uploadedUrl) {
        pdfUrl = uploadedUrl;
        // Send to webhook
        await sendToWebhook(uploadedUrl, formData);
      }
    }

    await updateInvoice.mutateAsync({
      id: selectedInvoice.id,
      updates: {
        company_id: formData.company_id,
        client_id: formData.client_id,
        invoice_number: formData.invoice_number,
        period_start: formData.period_start,
        period_end: formData.period_end,
        subtotal: parseFloat(formData.subtotal),
        vat_amount: parseFloat(formData.vat_amount),
        total: parseFloat(formData.total),
        status: formData.status,
        pdf_url: pdfUrl || null,
      },
    });

    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (!selectedInvoice) return;
    await deleteInvoice.mutateAsync(selectedInvoice.id);
    setIsDeleteDialogOpen(false);
    resetForm();
  };

  const openDeleteDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteDialogOpen(true);
  };

  const handleStatusChange = async (invoiceId: string, newStatus: string) => {
    try {
      await updateInvoice.mutateAsync({
        id: invoiceId,
        updates: {
          status: newStatus as "draft" | "sent" | "paid",
        },
      });
    } catch {
      // Status update failed - mutation error handling in useUpdateInvoice
    }
  };

const formatDateSwiss = (value?: string | Date | null) => {
  if (!value) return "";

  const parseFromString = (str: string) => {
    const trimmed = str.trim();
    const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    const dotMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);

    if (isoMatch) {
      const [, y, m, d] = isoMatch;
      return { day: Number(d), month: Number(m), year: Number(y) };
    }

    if (dotMatch) {
      const [, d, m, y] = dotMatch;
      return { day: Number(d), month: Number(m), year: Number(y) };
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return {
        day: parsed.getDate(),
        month: parsed.getMonth() + 1,
        year: parsed.getFullYear(),
      };
    }

    return null;
  };

  const parts =
    value instanceof Date
      ? { day: value.getDate(), month: value.getMonth() + 1, year: value.getFullYear() }
      : parseFromString(value);

  if (!parts) return typeof value === "string" ? value : "";

  const day = String(parts.day).padStart(2, "0");
  const month = String(parts.month).padStart(2, "0");
  const year = String(parts.year).padStart(4, "0");

  return `${day}.${month}.${year}`;
};

const formatDate = (dateString: string) => {
  return formatDateSwiss(dateString);
};

  const formatAmount = (amount: number | null | undefined) => {
    if (amount == null || isNaN(amount)) {
      return "CHF 0.00";
    }
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(amount);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "Entwurf";
      case "sent":
        return "Versendet";
      case "paid":
        return "Bezahlt";
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "outline" => {
    switch (status) {
      case "paid":
        return "default";
      case "sent":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getInvoiceMonthLabel = (value?: string | null) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return "";
    return parsed.toLocaleDateString("de-CH", { month: "long", year: "numeric" });
  };

  const invoiceSearchItems = (invoices ?? [])
    .map((invoice) => {
      const client = clients?.find((item) => item.id === invoice.client_id);
      const clientName = client
        ? `${client.first_name} ${client.last_name}`.trim()
        : "Unbekannter Klient";
      const companyId =
        client?.company_id || invoice.company_id || "no-company";
      const companyName =
        (invoice.company_id ? companies?.find((item) => item.id === invoice.company_id)?.name : "") ||
        (client as ClientWithRelations | undefined)?.kunden?.name ||
        "";
      const periodStart = formatDateSwiss(invoice.period_start);
      const periodEnd = formatDateSwiss(invoice.period_end);
      const periodRange = periodStart && periodEnd ? `${periodStart} - ${periodEnd}` : "";
      const monthLabel = getInvoiceMonthLabel(invoice.period_start || invoice.created_at);
      const monthKey = (() => {
        const basis = invoice.period_start || invoice.created_at;
        const parsed = new Date(basis);
        if (isNaN(parsed.getTime())) return "";
        return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
      })();

      const clientSearchText = [
        invoice.invoice_number,
        clientName,
        companyName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const monthSearchText = [
        monthLabel,
        monthKey,
        invoice.period_start,
        invoice.period_end,
        periodRange,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return {
        invoice,
        companyId,
        clientName,
        companyName,
        monthLabel,
        periodRange,
        clientSearchText,
        monthSearchText,
      };
    })
    .sort((a, b) => new Date(b.invoice.created_at).getTime() - new Date(a.invoice.created_at).getTime());

  const normalizedClientQuery = clientSearchQuery.trim().toLowerCase();
  const normalizedMonthQuery = monthSearchQuery.trim().toLowerCase();
  const invoiceSearchResults = invoiceSearchItems.filter((item) => {
    const matchesClient =
      !normalizedClientQuery || item.clientSearchText.includes(normalizedClientQuery);
    const matchesMonth =
      !normalizedMonthQuery || item.monthSearchText.includes(normalizedMonthQuery);
    return matchesClient && matchesMonth;
  });

  const handleInvoiceSearchSelect = (item: (typeof invoiceSearchItems)[number]) => {
    setIsInvoiceSearchOpen(false);
    setActiveTab("list");
    setSelectedClientId(item.invoice.client_id);
    setExpandedCompanies(new Set([item.companyId]));
    setFocusedInvoiceId(item.invoice.id);
    const invoiceDate = item.invoice.period_start || item.invoice.created_at;
    if (invoiceDate) {
      const date = new Date(invoiceDate);
      if (!isNaN(date.getTime())) {
        const monthValue = String(date.getMonth() + 1).padStart(2, "0");
        setListFilterYear(String(date.getFullYear()));
        setListFilterMonth(monthValue);
      }
    }
    const hasClientOption = clients?.some((client) => client.id === item.invoice.client_id);
    setListFilterClientId(hasClientOption ? item.invoice.client_id : "all");
  };

  useEffect(() => {
    if (!focusedInvoiceId || activeTab !== "list") return;

    const id = `invoice-${focusedInvoiceId}`;
    const handle = requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    return () => cancelAnimationFrame(handle);
  }, [focusedInvoiceId, activeTab, selectedClientId, expandedCompanies, invoices]);

  const filteredInvoices = React.useMemo(() => {
    if (!invoices || invoices.length === 0) return [];
    return invoices.filter((invoice) => {
      if (listFilterClientId !== "all" && invoice.client_id !== listFilterClientId) {
        return false;
      }

      // Employee filter via invoice→time_entries mapping
      if (listFilterEmployeeId !== "all") {
        const employeeIds = invoiceEmployeeMap[invoice.id];
        if (!employeeIds || !employeeIds.includes(listFilterEmployeeId)) {
          return false;
        }
      }

      if (listFilterYear === "all" && listFilterMonth === "all") return true;
      const dateSource = invoice.period_start || invoice.created_at;
      if (!dateSource) return false;
      const date = new Date(dateSource);
      if (isNaN(date.getTime())) return false;
      if (listFilterYear !== "all" && String(date.getFullYear()) !== listFilterYear) {
        return false;
      }
      if (listFilterMonth !== "all") {
        const monthValue = String(date.getMonth() + 1).padStart(2, "0");
        if (monthValue !== listFilterMonth) return false;
      }
      return true;
    });
  }, [invoices, listFilterClientId, listFilterEmployeeId, invoiceEmployeeMap, listFilterMonth, listFilterYear]);

  // Group invoices by company and client
  const groupedInvoices = React.useMemo(() => {
    const grouped: Record<string, Record<string, Invoice[]>> = {};

    invoices?.forEach((invoice) => {
      const companyId = (invoice as InvoiceWithRelations).companies?.id || 'no-company';
      const clientId = invoice.client_id || 'no-client';

      if (!grouped[companyId]) {
        grouped[companyId] = {};
      }
      if (!grouped[companyId][clientId]) {
        grouped[companyId][clientId] = [];
      }
      grouped[companyId][clientId].push(invoice);
    });

    return grouped;
  }, [invoices]);

  // Get latest invoice for a client
  const getLatestInvoice = (clientInvoices: Invoice[]) => {
    return clientInvoices.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
  };

  // Toggle company expansion
  const toggleCompany = (companyId: string) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedCompanies(newExpanded);
  };

  // Generate invoices for all clients with unbilled time entries
  const handleGenerateInvoices = useCallback(async () => {
    if (!selectedTemplateId) {
      toast.error(
        htmlTemplates.length <= 1
          ? "Keine Rechnungsvorlage gefunden"
          : "Bitte Standard-Rechnungsvorlage in den Einstellungen setzen"
      );
      return;
    }

    if (!activeCompanyId || !activeCompany) {
      toast.error("Bitte zuerst ein ERP-Unternehmen auswählen");
      return;
    }

    setGeneratingInvoices(true);
    try {
      // Fetch unbilled time entries grouped by client and company
      const { data: unbilledEntries, error } = await supabase
        .from("unbilled_time_entries")
        .select("*")
        .eq("unternehmen_id", activeCompanyId);

      if (error) {
        toast.error("Fehler beim Abrufen der Zeiterfassungen");
        return;
      }

      if (!unbilledEntries || unbilledEntries.length === 0) {
        toast.info("Keine unbezahlten Zeiterfassungen gefunden");
        return;
      }

      const filteredEntries = (() => {
        const monthFiltered =
          selectedInvoiceMonth === "all"
            ? unbilledEntries
            : unbilledEntries.filter((entry: TimeEntryWithRelations) => {
                const entryDate = new Date(entry.date);
                const [selectedYear, selectedMonth] = selectedInvoiceMonth.split("-").map(Number);
                return (
                  entryDate.getFullYear() === selectedYear &&
                  entryDate.getMonth() + 1 === selectedMonth
                );
              });

        if (selectedGenerateClientId === "all") return monthFiltered;
        return monthFiltered.filter((entry: TimeEntryWithRelations) => entry.client_id === selectedGenerateClientId);
      })();

      if (filteredEntries.length === 0) {
        toast.info("Keine unbezahlten Zeiterfassungen für Monat und Klient gefunden");
        return;
      }

      // Group entries by company_id and client_id
      interface EntryGroup {
        company_id: string | null;
        client_id: string | null;
        company_name: string | null;
        client_name: string | null;
        entries: typeof filteredEntries;
        total_cost: number;
      }
      const groupedEntries = filteredEntries.reduce((acc: Record<string, EntryGroup>, entry) => {
        const key = `${entry.company_id}-${entry.client_id}`;
        if (!acc[key]) {
          acc[key] = {
            company_id: entry.company_id,
            client_id: entry.client_id,
            company_name: entry.company_name,
            client_name: entry.client_name,
            entries: [],
            total_cost: 0,
          };
        }
        acc[key].entries.push(entry);
        acc[key].total_cost += entry.total_cost || 0;
        return acc;
      }, {});

      const groups = Object.values(groupedEntries);
      let successCount = 0;
      let failCount = 0;

      // Get the latest invoice number to generate new ones
      const { data: latestInvoice } = await supabase
        .from("invoices")
        .select("invoice_number")
        .eq("unternehmen_id", activeCompanyId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let invoiceCounter = 1;
      if (latestInvoice?.invoice_number) {
        const match = latestInvoice.invoice_number.match(/RE-\d+-(\d+)/);
        if (match) {
          invoiceCounter = parseInt(match[1]) + 1;
        }
      }

      // Create invoice for each group
      for (const group of groups) {
        try {
          const today = new Date();
          const invoiceYearMonth =
            selectedInvoiceMonth === "all"
              ? `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}`
              : selectedInvoiceMonth.replace("-", "");
          const invoiceNumber = `RE-${invoiceYearMonth}-${String(invoiceCounter).padStart(3, "0")}`;

          // Get period from time entries
          const dates = group.entries.map((e: TimeEntryWithRelations) => new Date(e.date));
          const periodStart = new Date(Math.min(...dates.map((d: Date) => d.getTime())));
          const periodEnd = new Date(Math.max(...dates.map((d: Date) => d.getTime())));

          // Fetch company details first to check customer type
          const { data: companyData, error: companyError } = await supabase
            .from("kunden")
            .select("*")
            .eq("id", group.company_id)
            .single();

          // companyError is non-fatal, continue with available data

          // Calculate totals with private customer surcharge if applicable
          let subtotal = group.total_cost;
          if (companyData?.customer_type === 'private') {
            // Recalculate subtotal with 20 CHF surcharge per hour
            subtotal = group.entries.reduce((sum: number, e: TimeEntryWithRelations) => {
              const effectiveRate = (e.hourly_rate || 0) + 20;
              return sum + (effectiveRate * (e.total_hours || 0));
            }, 0);
          }
          const vatAmount = 0; // No VAT
          const total = subtotal; // Total equals subtotal (no VAT added)

          // Create invoice
          const { data: newInvoice, error: invoiceError } = await supabase
            .from("invoices")
            .insert({
              unternehmen_id: activeCompanyId,
              company_id: group.company_id,
              client_id: group.client_id,
              invoice_number: invoiceNumber,
              period_start: periodStart.toISOString().split('T')[0],
              period_end: periodEnd.toISOString().split('T')[0],
              subtotal,
              vat_amount: vatAmount,
              total,
              status: 'draft',
            })
            .select()
            .single();

          if (invoiceError) throw invoiceError;

          // Use active company settings (invoice issuer)
          const companySettings = activeCompany;

          // Prepare company info from your settings
          const companyInfo = {
            name: companySettings.company_name,
            address: companySettings.address || "",
            buildingNumber: companySettings.building_number || "",
            zip: companySettings.zip ? parseInt(companySettings.zip) : 0,
            city: companySettings.city || "",
            country: companySettings.country || "CH",
            iban: companySettings.iban || "",
          };

          // Generate PDF with HTML Template
          try {
            if (!selectedTemplateId) {
              throw new Error('Bitte wählen Sie eine Vorlage aus');
            }

            // Fetch client details for placeholders (only in two_level mode where client_id is set)
            const clientData = group.client_id
              ? await supabase
                  .from("clients")
                  .select("*")
                  .eq("id", group.client_id)
                  .single()
                  .then(({ data }) => data)
              : null;

            // Fetch employee/user details for mitarbeiter placeholders
            const { data: userData, error: userError } = await supabase
              .from("employees")
              .select("*")
              .eq("id", user.id)
              .single();

            // userError is non-fatal, continue with available data

            // Get hourly rate from time entries or user settings
            let hourlyRate = group.entries.length > 0 ? group.entries[0].hourly_rate : 0;

            // Apply private customer surcharge if applicable
            if (companyData?.customer_type === 'private') {
              hourlyRate += 20; // Add 20 CHF surcharge for private customers
            }

            // Helpers for consistent Swiss date formatting and month/year derivation
            const formatDateDDMMYYYY = (date: Date) => formatDateSwiss(date);
            const { monthName: invoiceMonthName, year: invoiceYear } = (() => {
              if (selectedInvoiceMonth && selectedInvoiceMonth !== "all") {
                const [yr, m] = selectedInvoiceMonth.split("-").map((v) => parseInt(v, 10));
                if (!isNaN(yr) && !isNaN(m)) {
                  return {
                    monthName: new Date(yr, m - 1, 1).toLocaleString("de-CH", { month: "long" }),
                    year: String(yr),
                  };
                }
              }
              const now = new Date();
              return {
                monthName: now.toLocaleString("de-CH", { month: "long" }),
                year: String(now.getFullYear()),
              };
            })();

            const clientContactFirstName = resolveContactFirstName(clientData);
            const clientContactLastName = resolveContactLastName(clientData);
            const clientContactName = resolveContactFullName(clientData);
            const companyContactFirstName = resolveContactFirstName(companyData);
            const companyContactLastName = resolveContactLastName(companyData);
            const companyContactName = resolveContactFullName(companyData);
            const clientHasOwnAnsprechperson = Boolean(clientData) && Boolean(clientContactName);
            const hasAnyAnsprechperson = clientHasOwnAnsprechperson || Boolean(companyContactName);
            const contactFirstName = clientHasOwnAnsprechperson ? clientContactFirstName : companyContactFirstName;
            const contactLastName = clientHasOwnAnsprechperson ? clientContactLastName : companyContactLastName;
            const contactName = clientHasOwnAnsprechperson ? clientContactName : companyContactName;
            const contactSalutation = clientHasOwnAnsprechperson
              ? clientData?.contact_person_salutation
              : companyData?.contact_person_salutation;
            const ansprechpersonFallbackSalutation = clientData
              ? (contactSalutation || clientData?.salutation)
              : contactSalutation;
            const ansprechpersonFallbackLastName = clientData
              ? (hasAnyAnsprechperson ? contactLastName : (contactLastName || clientData?.last_name || ''))
              : contactLastName;

            // Prepare invoice data with all placeholders (with multiple variations for compatibility)
            const invoiceDataForTemplate: Record<string, string | number> = {
              // Invoice metadata
              rechnungsnummer: invoiceNumber,
              invoiceNumber: invoiceNumber,
              datum: formatDateDDMMYYYY(new Date()),
              date: formatDateDDMMYYYY(new Date()),
              monat: invoiceMonthName,
              jahr: invoiceYear,
              periodStart: periodStart.toISOString().split('T')[0],
              periodEnd: periodEnd.toISOString().split('T')[0],
              periodeVon: periodStart.toISOString().split('T')[0],
              periodeBis: periodEnd.toISOString().split('T')[0],

              // Company/Issuer data (your company) - multiple variations
              firmenname: companySettings.company_name || '',
              companyName: companySettings.company_name || '',
              strasse: companySettings.address || '',
              street: companySettings.address || '',
              hausnummer: companySettings.building_number || '',
              buildingNumber: companySettings.building_number || '',
              plz: companySettings.zip || '',
              zip: companySettings.zip || '',
              ort: companySettings.city || '',
              city: companySettings.city || '',
              land: companySettings.country || 'CH',
              country: companySettings.country || 'CH',
              telefon: companySettings.phone || '',
              phone: companySettings.phone || '',
              email: companySettings.email || '',
              website: companySettings.website || '',
              iban: companySettings.iban || '',
              mwstnummer: companySettings.vat_number || '',
              vatNumber: companySettings.vat_number || '',
              logoUrl: companySettings.logo_url || '',
              logo: companySettings.logo_url || '',

              // Employee/Mitarbeiter data
              mitarbeiterName: userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : user.email || '',
              mitarbeiterStundensatz: `${(hourlyRate || 0).toFixed(2)} CHF`,
              mitarbeiterStundensatzOhneCHF: (hourlyRate || 0).toFixed(2),

              // Client data (from clients table)
              klientAnrede: clientData?.salutation || '',
              klientAnredeBrief: formatSalutationLetter(clientData?.salutation),
              klientHoeflichkeitsanrede: formatFormalSalutation(clientData?.salutation, clientData?.last_name),
              ansprechpersonAnrede: contactSalutation || '',
              ansprechpersonAnredeBrief: formatSalutationLetter(contactSalutation),
              ansprechpersonHoeflichkeitsanrede: formatFormalSalutation(
                ansprechpersonFallbackSalutation,
                ansprechpersonFallbackLastName,
              ),
              ansprechpersonVorname: contactFirstName,
              ansprechpersonNachname: contactLastName,
              ansprechpersonName: contactName,
              klientVorname: clientData?.first_name || '',
              klientNachname: clientData?.last_name || '',
              klientGeburtstag: clientData?.birthdate ? formatDateSwiss(clientData.birthdate) : '',
              klientAdresse: clientData?.address || '',
              klientPlz: clientData?.zip || '',
              klientOrt: clientData?.city || '',
              klientStunden: group.entries.reduce((sum: number, e: TimeEntryWithRelations) => sum + (e.total_hours || 0), 0).toFixed(2),

              // Klient Unternehmen data (from companies table)
              firma: companyData?.name || group.company_name || '',
              klientUnternehmenName: companyData?.name || group.company_name || '',
              klientUnternehmenAdresse: companyData?.address
                ? `${companyData.address}${companyData.building_number ? ' ' + companyData.building_number : ''}`
                : '',
              klientUnternehmenPlz: companyData?.zip || '',
              klientUnternehmenOrt: companyData?.city || '',
              klientUnternehmenAnsprechperson: companyContactName,
              klientUnternehmenAnsprechpersonAnrede: companyData?.contact_person_salutation || '',
              klientUnternehmenAnsprechpersonAnredeBrief: formatSalutationLetter(companyData?.contact_person_salutation),
              ansprechperson: contactName,
              kundeAnrede: companyData?.salutation || '',
              kundeAnredeBrief: formatSalutationLetter(companyData?.salutation),
              kundeHoeflichkeitsanrede: formatFormalSalutation(companyData?.salutation, companyData?.name),

              // Additional client variations
              klient: group.client_name || `${clientData?.first_name || ''} ${clientData?.last_name || ''}`.trim(),
              client: group.client_name || `${clientData?.first_name || ''} ${clientData?.last_name || ''}`.trim(),
              klientName: group.client_name || `${clientData?.first_name || ''} ${clientData?.last_name || ''}`.trim(),

              // Financial data - multiple variations (with and without CHF)
              zwischensumme: `${subtotal.toFixed(2)} CHF`,
              subtotal: `${subtotal.toFixed(2)} CHF`,
              subTotal: `${subtotal.toFixed(2)} CHF`,
              zwischensummeOhneCHF: subtotal.toFixed(2),
              subtotalOhneCHF: subtotal.toFixed(2),
              mwst: `${vatAmount.toFixed(2)} CHF`,
              vat: `${vatAmount.toFixed(2)} CHF`,
              vatAmount: `${vatAmount.toFixed(2)} CHF`,
              mwstBetrag: `${vatAmount.toFixed(2)} CHF`,
              mwstOhneCHF: vatAmount.toFixed(2),
              vatOhneCHF: vatAmount.toFixed(2),
              total: `${total.toFixed(2)} CHF`,
              totalAmount: `${total.toFixed(2)} CHF`,
              betrag: `${total.toFixed(2)} CHF`,
              amount: `${total.toFixed(2)} CHF`,
              offenerBetrag: `${total.toFixed(2)} CHF`,
              openAmount: `${total.toFixed(2)} CHF`,
              gesamtbetrag: `${total.toFixed(2)} CHF`,
              totalOhneCHF: total.toFixed(2),
              betragOhneCHF: total.toFixed(2),

              // Time entries as positions
              // Time entries as positions - Aggregated Logic
              positionen: (() => {
                const getRateAndCost = (e: TimeEntryWithRelations) => {
                  const effectiveHourlyRate = companyData?.customer_type === 'private'
                    ? (e.hourly_rate || 0) + 20
                    : (e.hourly_rate || 0);
                  const effectiveLaborCost = effectiveHourlyRate * (e.total_hours || 0);
                  return { rate: effectiveHourlyRate, cost: effectiveLaborCost };
                };

                const regularEntries = group.entries.filter((e: TimeEntryWithRelations) => e.category !== 'Kurzkontakt');
                const kurzkontaktEntries = group.entries.filter((e: TimeEntryWithRelations) => e.category === 'Kurzkontakt');
                const finalPositions = [];

                // 1. Regular Entries
                regularEntries.forEach((e: TimeEntryWithRelations) => {
                  const { rate, cost } = getRateAndCost(e);
                  finalPositions.push({
                    beschreibung: e.activity_description || '',
                    description: e.activity_description || '',
                    datum: e.date ? formatDateSwiss(e.date) : '',
                    date: e.date ? formatDateSwiss(e.date) : '',
                    menge: e.total_hours?.toFixed(2) || '0',
                    quantity: e.total_hours?.toFixed(2) || '0',
                    anzahl: e.total_hours?.toFixed(2) || '0',
                    preis: `${rate.toFixed(2)} CHF`,
                    price: `${rate.toFixed(2)} CHF`,
                    einzelpreis: `${rate.toFixed(2)} CHF`,
                    unitPrice: `${rate.toFixed(2)} CHF`,
                    preisOhneCHF: rate.toFixed(2),
                    priceOhneCHF: rate.toFixed(2),
                    total: `${cost.toFixed(2)} CHF`,
                    gesamtpreis: `${cost.toFixed(2)} CHF`,
                    totalPrice: `${cost.toFixed(2)} CHF`,
                    totalOhneCHF: cost.toFixed(2),
                    gesamtpreisOhneCHF: cost.toFixed(2),
                  });
                });

                // 2. Aggregated Kurzkontakt Entry
                if (kurzkontaktEntries.length > 0) {
                  let sumHours = 0;
                  let sumCost = 0;

                  kurzkontaktEntries.forEach((e: TimeEntryWithRelations) => {
                    const { cost } = getRateAndCost(e);
                    sumHours += (e.total_hours || 0);
                    sumCost += cost;
                  });

                  const avgRate = sumHours > 0 ? sumCost / sumHours : 0;

                  finalPositions.push({
                    beschreibung: 'Kurzkontakt',
                    description: 'Kurzkontakt',
                    datum: '',
                    date: '',
                    menge: sumHours.toFixed(2),
                    quantity: sumHours.toFixed(2),
                    anzahl: sumHours.toFixed(2),
                    preis: `${avgRate.toFixed(2)} CHF`,
                    price: `${avgRate.toFixed(2)} CHF`,
                    einzelpreis: `${avgRate.toFixed(2)} CHF`,
                    unitPrice: `${avgRate.toFixed(2)} CHF`,
                    preisOhneCHF: avgRate.toFixed(2),
                    priceOhneCHF: avgRate.toFixed(2),
                    total: `${sumCost.toFixed(2)} CHF`,
                    gesamtpreis: `${sumCost.toFixed(2)} CHF`,
                    totalPrice: `${sumCost.toFixed(2)} CHF`,
                    totalOhneCHF: sumCost.toFixed(2),
                    gesamtpreisOhneCHF: sumCost.toFixed(2),
                  });
                }

                return finalPositions;
              })(),
            };

            // Generate QR Code
            const iban = companySettings?.iban?.replace(/\s/g, '') || '';
            const isValidSwissIban = /^CH\d{2}[A-Z0-9]{5}[A-Z0-9]{12}$/.test(iban);

            let qrCodeDataUrl = '';

            if (!isValidSwissIban) {
              console.warn('Invalid or missing IBAN, skipping QR code generation');
              toast.warning('QR-Code konnte nicht generiert werden: IBAN fehlt oder ist ungültig');
            } else {
              const { generateSwissQRCode } = await import('@/lib/swissQRCode');

              qrCodeDataUrl = await generateSwissQRCode({
                iban: iban,
                creditor: {
                  name: companySettings.company_name || '',
                  address: companySettings.address || '',
                  buildingNumber: companySettings.building_number || '',
                  zip: companySettings.zip || '',
                  city: companySettings.city || '',
                  country: companySettings.country || 'CH',
                },
                amount: total,
                currency: 'CHF',
                debtor: companyData ? {
                  name: companyData.name || '',
                  address: companyData.address || '',
                  buildingNumber: companyData.building_number || '',
                  zip: companyData.zip || '',
                  city: companyData.city || '',
                  country: 'CH',
                } : undefined,
                reference: invoiceNumber,
                additionalInfo: `Rechnung ${invoiceNumber}`,
              });
            }

            invoiceDataForTemplate['qr-code'] = qrCodeDataUrl;
            invoiceDataForTemplate['qrCodeDataUrl'] = qrCodeDataUrl;

            // Demo-Modus: KEIN echtes PDF/Export — nur HTML-Vorschau mit „DEMO"-Wasserzeichen.
            if (isDemoMode) {
              const previewUrl = createDemoInvoicePreviewUrl({
                invoiceNumber,
                dateLabel: formatDateSwiss(new Date().toISOString().slice(0, 10)),
                sender: {
                  name: companySettings.company_name || 'OneClick Office',
                  address: `${companySettings.address || ''}${companySettings.building_number ? ' ' + companySettings.building_number : ''}`,
                  zip: companySettings.zip || '',
                  city: companySettings.city || '',
                  iban: companySettings.iban || '',
                },
                recipient: {
                  company: companyData?.name || group.company_name || '',
                  person: `${clientData?.first_name || ''} ${clientData?.last_name || ''}`.trim(),
                  address: clientData?.address || '',
                  zip: clientData?.zip || '',
                  city: clientData?.city || '',
                },
                positionen: (invoiceDataForTemplate.positionen as DemoInvoicePreviewInput["positionen"]) || [],
                subtotalLabel: `${subtotal.toFixed(2)} CHF`,
                vatLabel: `${vatAmount.toFixed(2)} CHF`,
                totalLabel: `${total.toFixed(2)} CHF`,
                qrCodeDataUrl: qrCodeDataUrl || undefined,
              });
              await supabase
                .from('invoices')
                .update({ pdf_url: previewUrl })
                .eq('id', newInvoice.id);
            } else {
            // Call edge function to render HTML
            const response = await supabase.functions.invoke('generate-invoice-pdf', {
              body: {
                templateId: selectedTemplateId,
                invoiceData: invoiceDataForTemplate,
                userId: user.id,
              },
            });

            if (response.error || !response.data?.success) {
              throw new Error(response.error?.message || 'HTML rendering failed');
            }

            // Convert rendered HTML to PDF
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');

            // v0.7.0: Edge Function liefert jetzt ein Array `pages: string[]`.
            // Backwards-compat: falls nur `html` vorhanden (alter Deploy), als
            // Single-Page-Array behandeln.
            const pages: string[] = Array.isArray(response.data.pages) && response.data.pages.length > 0
              ? response.data.pages
              : [response.data.html];

            // Temporaerer Render-Container (recycled pro Seite)
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '0';
            document.body.appendChild(tempDiv);

            try {
              const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
              });

              const pdfWidth = 210;
              const pdfHeight = 297;

              // v0.7.0 Render-Strategie:
              // Jede Seite aus pages[] ist bereits exakt A4-dimensioniert
              // (.pdf-page oder .qr-page mit width/height 794/1123 oder 210/297mm).
              // Wir rendern mit FIXER windowHeight=1123 -> kein Aspect-Ratio-Shift,
              // keine Skalierungs-Verzerrung.
              const renderPageToPdf = async (pageHtml: string, isFirstPage: boolean) => {
                // Kompletten HTML-String (incl. <html><head><style>...) in tempDiv
                // setzen. html2canvas liest den Container, Style-Tags im Body werden
                // vom Browser geparst und angewandt.
                tempDiv.innerHTML = pageHtml;

                // html2canvas braucht ein konkretes Ziel-Element. Wir nehmen
                // das <body> aus dem geparsten Dokument, fallback: tempDiv selbst.
                const target = (tempDiv.querySelector('body') as HTMLElement | null) ?? tempDiv;

                const canvas = await html2canvas(target, {
                  scale: 2.5,
                  useCORS: true,
                  logging: false,
                  backgroundColor: '#ffffff',
                  windowWidth: 794,
                  windowHeight: 1123,
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.95);

                if (!isFirstPage) pdf.addPage();
                // Vollflaechig auf A4 legen - keine Aspect-Ratio-Berechnung noetig,
                // weil Source exakt A4-Proportion hat.
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
              };

              // Alle Seiten sequenziell rendern
              for (let i = 0; i < pages.length; i++) {
                await renderPageToPdf(pages[i], i === 0);
              }

              const pdfBlob = pdf.output('blob');

              // Log the PDF size for debugging
              // Upload PDF to Supabase Storage
              const fileName = `${user?.id}/${invoiceNumber}.pdf`;
              const { error: uploadError } = await supabase.storage
                .from("INVOICES")
                .upload(fileName, pdfBlob, {
                  contentType: 'application/pdf',
                  upsert: true,
                });

              if (uploadError) throw uploadError;

              // Get public URL
              const { data: { publicUrl } } = supabase.storage
                .from("INVOICES")
                .getPublicUrl(fileName);

              // Update invoice with PDF URL
              await supabase
                .from("invoices")
                .update({ pdf_url: publicUrl })
                .eq("id", newInvoice.id);

              // Send to webhook if configured
              if (N8N_WEBHOOK_URL) {
                await sendToWebhook(publicUrl, {
                  invoice_number: invoiceNumber,
                  company_id: group.company_id,
                  client_id: group.client_id,
                  total,
                  status: 'draft',
                });
              }
            } finally {
              // Cleanup temp div (laeuft auch bei Fehlern im renderPageToPdf)
              if (tempDiv && tempDiv.parentNode) {
                document.body.removeChild(tempDiv);
              }
            }
            } // Ende Nicht-Demo-Pfad (echtes PDF + Storage)
          } catch (pdfError: unknown) {
            const pdfErrorMessage = pdfError instanceof Error ? pdfError.message : 'Unbekannter Fehler';
            console.error('PDF generation failed:', pdfError);
            toast.warning(`Rechnung erstellt, aber PDF-Generierung fehlgeschlagen: ${pdfErrorMessage}`);
          }

          // Link time entries to invoice and mark as billed
          const timeEntryIds = group.entries.map((e: TimeEntryWithRelations) => e.id);
          const { error: updateError } = await supabase
            .from("time_entries")
            .update({
              invoice_id: newInvoice.id,
              is_billed: true
            })
            .in("id", timeEntryIds);

          if (updateError) throw updateError;

          // Auto-generate work report (Arbeitsrapport) immediately after invoice creation
          // Im Demo-Modus übersprungen (kein echter Export/Storage).
          if (!isDemoMode) try {
            const { generateWorkReportForInvoice } = await import('@/utils/workReportGenerator');
            const workReportResult = await generateWorkReportForInvoice(newInvoice.id);

          } catch (workReportError: unknown) {
            const workReportErrorMessage = workReportError instanceof Error ? workReportError.message : 'Unbekannter Fehler';
            console.error('Work report generation failed:', workReportError);
            toast.warning(`Arbeitsrapport konnte nicht generiert werden: ${workReportErrorMessage}`);
          }

          successCount++;
          invoiceCounter++;
        } catch (invoiceError: unknown) {
          console.error('Invoice creation failed:', invoiceError);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} Rechnung(en) erfolgreich erstellt`);

        // Refresh invoice list to show newly created invoices
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
        queryClient.invalidateQueries({ queryKey: ['unbilled_time_entries'] });
        queryClient.invalidateQueries({ queryKey: ['invoice_employee_map'] });
      }
      if (failCount > 0) {
        toast.error(`${failCount} Rechnung(en) konnten nicht erstellt werden`);
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      console.error('Invoice generation failed:', error);
      toast.error(`Fehler beim Generieren der Rechnungen: ${errorMessage}`);
    } finally {
      setGeneratingInvoices(false);
    }
  }, [
    selectedTemplateId,
    user,
    queryClient,
    activeCompanyId,
    activeCompany,
    selectedInvoiceMonth,
    selectedGenerateClientId,
    htmlTemplates.length,
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rechnungen</h1>
          <p className="text-muted-foreground mt-1">Übersicht und Generierung von Rechnungen</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neue Rechnung
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Neue Rechnung erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie eine neue Rechnung für einen Klienten
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Firma</Label>
                  <Select
                    value={formData.company_id}
                    onValueChange={(value) => {
                      setFormData({ ...formData, company_id: value, client_id: "" });
                    }}
                  >
                    <SelectTrigger id="company">
                      <SelectValue placeholder="Firma wählen (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies?.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Klient *</Label>
                  <Select
                    value={formData.client_id}
                    onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                    required
                  >
                    <SelectTrigger id="client">
                      <SelectValue placeholder="Klient wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {(formData.company_id ? filteredClients : clients)?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.first_name} {client.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-number">Rechnungsnummer *</Label>
                <Input
                  id="invoice-number"
                  placeholder="RE-2025-001"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="period-start">Zeitraum Start *</Label>
                  <Input
                    id="period-start"
                    type="date"
                    value={formData.period_start}
                    onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period-end">Zeitraum Ende *</Label>
                  <Input
                    id="period-end"
                    type="date"
                    value={formData.period_end}
                    onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subtotal">Zwischensumme (CHF) *</Label>
                  <Input
                    id="subtotal"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.subtotal}
                    onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
                    onBlur={calculateTotal}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vat">MwSt. Betrag (CHF) *</Label>
                  <Input
                    id="vat"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.vat_amount}
                    onChange={(e) => setFormData({ ...formData, vat_amount: e.target.value })}
                    onBlur={calculateTotal}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="total">Gesamtbetrag (CHF) *</Label>
                <Input
                  id="total"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value: string) => setFormData({ ...formData, status: value })} required>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Status wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Entwurf</SelectItem>
                    <SelectItem value="sent">Versendet</SelectItem>
                    <SelectItem value="paid">Bezahlt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdf">Rechnung PDF</Label>
                <Input
                  id="pdf"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setPdfFile(file);
                  }}
                />
                {uploading && (
                  <div className="text-sm text-muted-foreground">
                    <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                    Wird hochgeladen und an Webhook gesendet...
                  </div>
                )}
                {pdfFile && !uploading && (
                  <div className="text-sm text-green-600">
                    Datei ausgewählt: {pdfFile.name}
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={createInvoice.isPending || uploading}>
                {createInvoice.isPending || uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird erstellt...
                  </>
                ) : (
                  "Rechnung erstellen"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col gap-4">
          <TabsList className="grid grid-cols-2 w-full sm:w-auto">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Rechnungsliste
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <FileStack className="h-4 w-4" />
              Manuelle Rechnung
            </TabsTrigger>
          </TabsList>

          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
              <div className="space-y-1.5">
                <Label htmlFor="invoice-search-trigger" className="text-xs font-medium text-muted-foreground">Suche</Label>
                <Popover open={isInvoiceSearchOpen} onOpenChange={setIsInvoiceSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="invoice-search-trigger"
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="truncate">Rechnungen suchen</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-[280px] sm:w-[360px] md:w-[420px] max-w-[calc(100vw-2rem)] p-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold sm:text-sm">Rechnungen durchsuchen</p>
                        <Badge variant="outline">{invoiceSearchResults.length} Rechnungen</Badge>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="invoice-search-client" className="text-xs sm:text-sm">Klient</Label>
                          <Input
                            id="invoice-search-client"
                            value={clientSearchQuery}
                            onChange={(event) => setClientSearchQuery(event.target.value)}
                            placeholder="Name oder Firma"
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="invoice-search-month" className="text-xs sm:text-sm">Monat</Label>
                          <Input
                            id="invoice-search-month"
                            value={monthSearchQuery}
                            onChange={(event) => setMonthSearchQuery(event.target.value)}
                            placeholder="z.B. 2024-03 oder März 2024"
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                      <div className="max-h-72 overflow-auto rounded-md border">
                        {invoiceSearchResults.length === 0 ? (
                          <p className="p-3 text-sm text-muted-foreground">Keine Rechnungen gefunden.</p>
                        ) : (
                          <div className="divide-y">
                            {invoiceSearchResults.map((item) => (
                              <button
                                key={item.invoice.id}
                                type="button"
                                onClick={() => handleInvoiceSearchSelect(item)}
                                className="flex w-full items-start justify-between gap-3 p-3 text-left text-sm hover:bg-muted/50"
                              >
                                <div className="min-w-0">
                                  <div className="truncate font-medium">{item.invoice.invoice_number}</div>
                                  <div className="truncate text-xs text-muted-foreground">
                                    {item.clientName}
                                    {item.companyName ? ` · ${item.companyName}` : ""}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {item.monthLabel || "Unbekannter Monat"}
                                    {item.periodRange ? ` · ${item.periodRange}` : ""}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-sm font-semibold">
                                    {formatAmount(item.invoice.total)}
                                  </span>
                                  <Badge variant={getStatusVariant(item.invoice.status)}>
                                    {getStatusLabel(item.invoice.status)}
                                  </Badge>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              {!isSingle && (
              <div className="space-y-1.5">
                <Label htmlFor="invoice-generate-client" className="text-xs font-medium text-muted-foreground">Klient</Label>
                <Select value={selectedGenerateClientId} onValueChange={setSelectedGenerateClientId}>
                  <SelectTrigger id="invoice-generate-client">
                    <SelectValue placeholder="Alle Klienten" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Klienten</SelectItem>
                    {clients?.map((client) => {
                      const clientName = [client.first_name, client.last_name]
                        .filter(Boolean)
                        .join(" ")
                        .trim();
                      const companyName = (client as ClientWithRelations).kunden?.name;
                      const baseName = clientName || (client as ClientWithRelations).email || "Klient";
                      const label = companyName ? `${baseName} · ${companyName}` : baseName;
                      return (
                        <SelectItem key={client.id} value={client.id}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="invoice-generate-month" className="text-xs font-medium text-muted-foreground">Monat</Label>
                <Select value={selectedInvoiceMonth} onValueChange={setSelectedInvoiceMonth}>
                  <SelectTrigger id="invoice-generate-month">
                    <SelectValue placeholder="Monat wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Monate</SelectItem>
                    {invoiceMonthOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleGenerateInvoices}
                  disabled={generatingInvoices}
                  className="group relative w-full overflow-hidden border-0 bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl hover:shadow-orange-500/50 hover:brightness-110 disabled:opacity-70"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  {generatingInvoices ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generiert...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2 fill-current drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                      Rechnungen generieren
                    </>
                  )}
                </Button>
              </div>
            </div>
            {!selectedTemplateId && htmlTemplates.length > 1 && (
              <p className="text-sm text-muted-foreground mt-3">
                Standard-Vorlage fehlt (Einstellungen).
              </p>
            )}
          </div>

        <div className="mt-4 rounded-lg border bg-muted/50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4 text-primary" />
              {activeCompanyId ? (
                isLoadingUnbilledEntries ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Offene Zeiteinträge werden geladen...
                  </span>
                ) : openEntriesCount === 0 ? (
                  <span>Keine offenen Zeiteinträge für {generationFilterLabel}.</span>
                ) : (
                  <span>
                    Für {generationFilterLabel} liegen {openEntriesCount} offene Zeiteinträge vor.
                    Daraus entstehen voraussichtlich {invoicesToGenerateCount} Rechnung
                    {invoicesToGenerateCount === 1 ? "" : "en"}.
                  </span>
                )
              ) : (
                <span>Bitte wählen Sie zuerst ein ERP-Unternehmen, um offene Zeiteinträge zu sehen.</span>
              )}
            </div>
            {activeCompanyId && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1 text-sm">
                  {isLoadingUnbilledEntries ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Calendar className="h-4 w-4" />
                  )}
                  {isLoadingUnbilledEntries ? "Lädt..." : `${openEntriesCount} offene Einträge`}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-2 px-3 py-1 text-sm">
                  {isLoadingUnbilledEntries ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  {isLoadingUnbilledEntries ? "..." : `${invoicesToGenerateCount} Rechnungen`}
                </Badge>
              </div>
            )}
          </div>
        </div>
        </div>

        <TabsContent value="list" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Alle Rechnungen</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Jahr: {listFilterYearLabel}</Badge>
                  <Badge variant="secondary">Monat: {listFilterMonthLabel}</Badge>
                  <Badge variant="outline">Klient: {listFilterClientLabel}</Badge>
                  <Badge variant="outline">Mitarbeiter: {listFilterEmployeeLabel}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 rounded-lg border bg-muted/30 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 items-end">
                  <div className="space-y-1.5">
                    <Label htmlFor="invoice-list-year-select" className="text-xs font-medium text-muted-foreground">Jahr</Label>
                    <Select value={listFilterYear} onValueChange={setListFilterYear}>
                      <SelectTrigger id="invoice-list-year-select">
                        <SelectValue placeholder="Alle Jahre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle Jahre</SelectItem>
                        {listYearOptions.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="invoice-list-month-select" className="text-xs font-medium text-muted-foreground">Monat</Label>
                    <Select value={listFilterMonth} onValueChange={setListFilterMonth}>
                      <SelectTrigger id="invoice-list-month-select">
                        <SelectValue placeholder="Alle Monate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle Monate</SelectItem>
                        {listMonthOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {!isSingle && (
                  <div className="space-y-1.5">
                    <Label htmlFor="invoice-list-client-select" className="text-xs font-medium text-muted-foreground">Klient</Label>
                    <Select value={listFilterClientId} onValueChange={setListFilterClientId}>
                      <SelectTrigger id="invoice-list-client-select">
                        <SelectValue placeholder="Alle Klienten" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle Klienten</SelectItem>
                        {clients?.map((client) => {
                          const clientName = [client.first_name, client.last_name].filter(Boolean).join(" ").trim();
                          const companyName = (client as ClientWithRelations).kunden?.name;
                          const baseName = clientName || (client as ClientWithRelations).email || "Klient";
                          const label = companyName ? `${baseName} · ${companyName}` : baseName;
                          return (
                            <SelectItem key={client.id} value={client.id}>
                              {label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="invoice-list-employee-select" className="text-xs font-medium text-muted-foreground">Mitarbeiter</Label>
                    <Select value={listFilterEmployeeId} onValueChange={setListFilterEmployeeId}>
                      <SelectTrigger id="invoice-list-employee-select">
                        <SelectValue placeholder="Alle Mitarbeitende" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle Mitarbeitende</SelectItem>
                        {employees?.map((employee) => {
                          const name = [employee.first_name, employee.last_name].filter(Boolean).join(" ").trim() || "Mitarbeiter";
                          return (
                            <SelectItem key={employee.id} value={employee.id}>
                              {name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  {(listFilterMonth !== "all" ||
                    listFilterYear !== "all" ||
                    listFilterClientId !== "all" ||
                    listFilterEmployeeId !== "all") && (
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setListFilterYear("all");
                          setListFilterMonth("all");
                          setListFilterClientId("all");
                          setListFilterEmployeeId("all");
                        }}
                      >
                        Filter zurücksetzen
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredInvoices.length > 0 ? (
                <HierarchicalInvoiceList
                  invoices={filteredInvoices as InvoiceWithRelations[]}
                  companies={companies || []}
                  clients={clients || []}
                  expandedCompanies={expandedCompanies}
                  selectedClientId={selectedClientId}
                  onExpandedCompaniesChange={setExpandedCompanies}
                  onSelectedClientIdChange={setSelectedClientId}
                  focusedInvoiceId={focusedInvoiceId}
                  onEdit={handleEdit}
                  onDelete={openDeleteDialog}
                  onStatusChange={handleStatusChange}
                  formatDate={formatDate}
                  formatAmount={formatAmount}
                  getStatusLabel={getStatusLabel}
                  getStatusVariant={getStatusVariant}
                  mode={hierarchyMode}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Rechnungen mit den aktuellen Filtern
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="mt-6">
          <HtmlInvoiceGenerator templates={htmlTemplates} />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rechnung bearbeiten</DialogTitle>
            <DialogDescription>
              Aktualisieren Sie die Details der Rechnung
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-company">Firma *</Label>
                <Select
                  value={formData.company_id}
                  onValueChange={(value) => {
                    setFormData({ ...formData, company_id: value, client_id: "" });
                  }}
                  required
                >
                  <SelectTrigger id="edit-company">
                    <SelectValue placeholder="Firma wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies?.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-client">Klient *</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                  required
                  disabled={!formData.company_id}
                >
                  <SelectTrigger id="edit-client">
                    <SelectValue placeholder="Klient wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredClients?.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.first_name} {client.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-invoice-number">Rechnungsnummer *</Label>
              <Input
                id="edit-invoice-number"
                placeholder="RE-2025-001"
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-period-start">Zeitraum Start *</Label>
                <Input
                  id="edit-period-start"
                  type="date"
                  value={formData.period_start}
                  onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-period-end">Zeitraum Ende *</Label>
                <Input
                  id="edit-period-end"
                  type="date"
                  value={formData.period_end}
                  onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-subtotal">Zwischensumme (CHF) *</Label>
                <Input
                  id="edit-subtotal"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.subtotal}
                  onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
                  onBlur={calculateTotal}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-vat">MwSt. Betrag (CHF) *</Label>
                <Input
                  id="edit-vat"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.vat_amount}
                  onChange={(e) => setFormData({ ...formData, vat_amount: e.target.value })}
                  onBlur={calculateTotal}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-total">Gesamtbetrag (CHF) *</Label>
              <Input
                id="edit-total"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.total}
                onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: string) => setFormData({ ...formData, status: value })} required>
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Status wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Entwurf</SelectItem>
                  <SelectItem value="sent">Versendet</SelectItem>
                  <SelectItem value="paid">Bezahlt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-pdf">Rechnung PDF {formData.pdf_url && "(Neues PDF überschreibt altes)"}</Label>
              {formData.pdf_url && !pdfFile && (
                <div className="mb-2">
                  <a
                    href={formData.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 text-sm"
                  >
                    <FileText className="h-4 w-4" />
                    Aktuelles PDF anzeigen
                  </a>
                </div>
              )}
              <Input
                id="edit-pdf"
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPdfFile(file);
                }}
              />
              {uploading && (
                <div className="text-sm text-muted-foreground">
                  <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                  Wird hochgeladen und an Webhook gesendet...
                </div>
              )}
              {pdfFile && !uploading && (
                <div className="text-sm text-green-600">
                  Neue Datei ausgewählt: {pdfFile.name}
                </div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={updateInvoice.isPending || uploading}>
              {updateInvoice.isPending || uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird aktualisiert...
                </>
              ) : (
                "Änderungen speichern"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rechnung löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie die Rechnung <strong>{selectedInvoice?.invoice_number}</strong> wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={resetForm}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteInvoice.isPending}
            >
              {deleteInvoice.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gelöscht...
                </>
              ) : (
                "Löschen"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Rechnungen;
