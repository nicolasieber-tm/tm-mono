import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ViewModeToggle } from "@/components/expenses/ViewModeToggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Loader2, ExternalLink, ScanLine, Keyboard, FileDown, FileSpreadsheet } from "lucide-react";
import { ExpenseDriveView } from "@/components/expenses/ExpenseDriveView";
import { ExpenseLineItemsEditor } from "@/components/expenses/ExpenseLineItemsEditor";
import type {
  ViewMode,
  Expense,
  ExpenseCategory as DriveExpenseCategory,
} from "@/components/expenses/types";
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense, useCreateRecurringExpense } from "@/hooks/useExpenses";
import { useBananaExport } from "@/hooks/useBananaExport";
import { useExpenseExport } from "@/hooks/useExpenseExport";
import { useUnternehmenBananaSettings } from "@/hooks/useUnternehmenBananaSettings";
import { useUnternehmenSettings } from "@/hooks/useUnternehmenSettings";
import { useIsSingleLevel } from "@/hooks/useClientHierarchyMode";
import { useClients } from "@/hooks/useClients";
import { useKunden } from "@/hooks/useKunden";
import { useEmployees } from "@/hooks/useEmployees";
import { useExpenseCategories } from "@/hooks/useExpenseCategories";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";
import type { ExpenseWithRelations } from "@/utils/expenseExport";
import { toast } from "sonner";

const Spesen = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [createTab, setCreateTab] = useState("scan");
  const [processingRecurring, setProcessingRecurring] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportScope, setExportScope] = useState<"all" | "month">("all");
  const [exportMonth, setExportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isBananaDialogOpen, setIsBananaDialogOpen] = useState(false);
  const [bananaDateFrom, setBananaDateFrom] = useState("");
  const [bananaDateTo, setBananaDateTo] = useState("");
  const [bananaIncludeExported, setBananaIncludeExported] = useState(false);
  const bananaExportMutation = useBananaExport();
  const [isExpenseExportDialogOpen, setIsExpenseExportDialogOpen] = useState(false);
  const [expExportFrom, setExpExportFrom] = useState("");
  const [expExportTo, setExpExportTo] = useState("");
  const expenseExportMutation = useExpenseExport();
  const { data: bananaSettings } = useUnternehmenBananaSettings();
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv">("pdf");

  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();

  const [formData, setFormData] = useState({
    company_id: "",
    client_id: "",
    employee_id: user?.id || "",
    expense_date: new Date().toISOString().split('T')[0],
    amount: "",
    category: "",
    notes: "",
    is_recurring_monthly: false,
    recurrence_frequency: "monthly",
    recurrence_interval: "1",
    recurrence_day: new Date().getDate().toString(),
    recurring_expense_id: "",
    receipt_image_url: "",
  });
  const { data: expenses, isLoading } = useExpenses();
  const exportableExpenses = (expenses as ExpenseWithRelations[] | undefined) || [];
  const { data: companies } = useKunden();
  const { data: settings } = useUnternehmenSettings();
  const expenseClientLinkingEnabled =
    settings?.expense_client_linking_enabled ?? false;
  const isSingle = useIsSingleLevel();
  const { data: clients } = useClients({ enabled: expenseClientLinkingEnabled });
  const filteredClients =
    clients?.filter((c) => c.company_id === formData.company_id) || [];
  const { data: employees } = useEmployees();
  const { data: categories, isLoading: loadingCategories } = useExpenseCategories();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();
  const createRecurringExpense = useCreateRecurringExpense();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "ordner";
    const stored = localStorage.getItem("spesen.viewMode");
    return stored === "liste" ? "liste" : "ordner";
  });

  useEffect(() => {
    localStorage.setItem("spesen.viewMode", viewMode);
  }, [viewMode]);

  const categoriesMeta = (categories ?? []) as DriveExpenseCategory[];

  const resetForm = () => {
    setFormData({
      company_id: "",
      client_id: "",
      employee_id: user?.id || "",
      expense_date: new Date().toISOString().split('T')[0],
      amount: "",
      category: "",
      notes: "",
      is_recurring_monthly: false,
      recurrence_frequency: "monthly",
      recurrence_interval: "1",
      recurrence_day: new Date().getDate().toString(),
      recurring_expense_id: "",
      receipt_image_url: "",
    });
    setSelectedExpense(null);
    setImageFile(null);
    setCreateTab("scan");
  };

  const uploadReceipt = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("Spesen")
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("Spesen")
        .getPublicUrl(fileName);

      return publicUrl;
    } catch {
      toast.error("Fehler beim Hochladen des Belegs");
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Live-Update: lauscht auf den AI-Verarbeitungs-Status der frisch erstellten
  // Spese (gleicher Mechanismus wie in der Mobile-App) und aktualisiert die
  // Spesen-Liste, sobald die Edge Function fertig ist.
  const subscribeToExpenseUpdate = (expenseId: string) => {
    const channel = supabase
      .channel(`expense-${expenseId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "expenses",
          filter: `id=eq.${expenseId}`,
        },
        (payload) => {
          const updated = payload.new as {
            status: string;
            amount: number | null;
            category: string | null;
            processing_error: string | null;
          };
          if (updated.status === "completed") {
            toast.success(
              `✅ ${updated.amount?.toFixed(2) ?? "0.00"} CHF erkannt: ${updated.category ?? ""}`,
              { duration: 5000 }
            );
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
            supabase.removeChannel(channel);
          } else if (updated.status === "failed") {
            toast.error(
              `❌ ${updated.processing_error ?? "Fehler bei Verarbeitung"}`,
              { duration: 8000 }
            );
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
            supabase.removeChannel(channel);
          }
        }
      )
      .subscribe();

    // Auto-Cleanup nach 60 Sekunden, falls nichts kommt.
    setTimeout(() => {
      supabase.removeChannel(channel);
    }, 60000);
  };

  const handleCreateScan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error("Bitte laden Sie einen Beleg hoch");
      return;
    }
    if (!activeCompanyId) {
      toast.error("Bitte zuerst ein ERP-Unternehmen auswählen");
      return;
    }

    const uploadedUrl = await uploadReceipt(imageFile);
    if (!uploadedUrl) return;

    // Moderner Flow (wie Mobile): expenses-Zeile mit status='processing'
    // einfügen. Der Postgres-Trigger ruft die Edge Function
    // extract-expense-from-receipt auf; das Live-Update via Realtime
    // aktualisiert die Liste, sobald die AI fertig ist. Die optionale
    // Kunde-/Klient-Zuordnung wird direkt mitgespeichert.
    const { data: newExpense, error } = await supabase
      .from("expenses")
      .insert({
        employee_id: formData.employee_id || user?.id || "",
        unternehmen_id: activeCompanyId,
        company_id: formData.company_id || null,
        client_id: isSingle ? null : formData.client_id || null,
        receipt_image_url: uploadedUrl,
        status: "processing",
        expense_date: new Date().toISOString().split("T")[0],
        amount: 0,
        category: "Wird erkannt...",
      })
      .select("id")
      .single();

    if (error || !newExpense) {
      toast.error("Fehler beim Speichern des Belegs");
      return;
    }

    toast.success("Beleg hochgeladen – wird automatisch analysiert …");
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    subscribeToExpenseUpdate(newExpense.id);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompanyId) {
      toast.error("Bitte zuerst ein ERP-Unternehmen auswählen");
      return;
    }

    setProcessingRecurring(true);
    try {
      let receiptUrl = null;
      if (imageFile) {
        receiptUrl = await uploadReceipt(imageFile);
      }

      let recurringTemplateId: string | null = null;

      if (formData.is_recurring_monthly) {
        const recurrenceInterval = parseInt(formData.recurrence_interval || "1", 10);
        const recurrenceDay = getRecurrenceDayValue(
          formData.recurrence_frequency,
          formData.expense_date,
          formData.recurrence_day
        );

        const template = await createRecurringExpense.mutateAsync({
          company_id: formData.company_id || null,
          employee_id: formData.employee_id,
          start_date: formData.expense_date,
          last_generated_date: formData.expense_date,
          amount: parseFloat(formData.amount),
          category: formData.category,
          notes: formData.notes || null,
          receipt_image_url: receiptUrl,
          interval: recurrenceInterval,
          frequency: formData.recurrence_frequency,
          recurrence_day: recurrenceDay,
          is_active: true
        });

        recurringTemplateId = template?.id || null;
        if (!recurringTemplateId) {
          toast.warning("Wiederkehrende Spese erstellt, konnte aber nicht verknüpft werden.");
        }
      }

      await createExpense.mutateAsync({
        company_id: formData.company_id || null,
        client_id: isSingle ? null : formData.client_id || null,
        employee_id: formData.employee_id,
        expense_date: formData.expense_date,
        amount: parseFloat(formData.amount),
        category: formData.category,
        notes: formData.notes || null,
        is_recurring_monthly: formData.is_recurring_monthly && formData.recurrence_frequency === "monthly",
        recurrence_frequency: formData.is_recurring_monthly ? formData.recurrence_frequency : null,
        recurring_expense_id: recurringTemplateId,
        receipt_image_url: receiptUrl,
        imported_via_bono: false,
      });

      if (formData.is_recurring_monthly && recurringTemplateId) {
        toast.success("Wiederholung eingerichtet");
      }

      setIsCreateDialogOpen(false);
      resetForm();
    } catch {
      toast.error("Fehler beim Speichern der Spese");
    } finally {
      setProcessingRecurring(false);
    }
  };

  const loadRecurringTemplate = async (recurringExpenseId: string) => {
    setProcessingRecurring(true);
    try {
      if (!activeCompanyId) {
        toast.error("Bitte zuerst ein ERP-Unternehmen auswählen");
        return;
      }

      const { data, error } = await supabase
        .from("recurring_expenses")
        .select("frequency, interval, recurrence_day")
        .eq("id", recurringExpenseId)
        .eq("unternehmen_id", activeCompanyId)
        .single();

      if (error) throw error;

      setFormData((prev) => ({
        ...prev,
        is_recurring_monthly: true,
        recurrence_frequency: data?.frequency || prev.recurrence_frequency,
        recurrence_interval: (data?.interval ?? 1).toString(),
        recurrence_day: data?.recurrence_day?.toString() || prev.recurrence_day,
        recurring_expense_id: recurringExpenseId,
      }));
    } catch {
      toast.error("Wiederholungsdetails konnten nicht geladen werden");
    } finally {
      setProcessingRecurring(false);
    }
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    const recurrenceFrequency = expense.recurrence_frequency || (expense.is_recurring_monthly ? "monthly" : "");
    const recurringExpenseId = expense.recurring_expense_id || "";
    const isRecurring = !!recurrenceFrequency || !!recurringExpenseId || expense.is_recurring_monthly;

    setFormData({
      company_id: expense.company_id || "",
      client_id: expense.client_id || "",
      employee_id: expense.employee_id,
      expense_date: expense.expense_date,
      amount: expense.amount.toString(),
      category: expense.category,
      notes: expense.notes || "",
      is_recurring_monthly: isRecurring,
      recurrence_frequency: recurrenceFrequency || "monthly",
      recurrence_interval: "1",
      recurrence_day: getRecurrenceDayValue(recurrenceFrequency || "monthly", expense.expense_date).toString(),
      recurring_expense_id: recurringExpenseId,
      receipt_image_url: expense.receipt_image_url || "",
    });

    if (recurringExpenseId) {
      loadRecurringTemplate(recurringExpenseId);
    }
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpense) return;
    if (!activeCompanyId) {
      toast.error("Bitte zuerst ein ERP-Unternehmen auswählen");
      return;
    }

    setProcessingRecurring(true);
    try {
      let receiptUrl = formData.receipt_image_url;
      if (imageFile) {
        const uploadedUrl = await uploadReceipt(imageFile);
        if (uploadedUrl) {
          receiptUrl = uploadedUrl;
        }
      }

      const isRecurring = formData.is_recurring_monthly;
      const recurrenceFrequency = formData.recurrence_frequency;
      let recurringTemplateId = formData.recurring_expense_id || "";

      if (isRecurring) {
        const recurrenceInterval = parseInt(formData.recurrence_interval || "1", 10);
        const recurrenceDay = getRecurrenceDayValue(
          recurrenceFrequency,
          formData.expense_date,
          formData.recurrence_day
        );

        if (recurringTemplateId) {
          const { error } = await supabase
            .from("recurring_expenses")
            .update({
              unternehmen_id: activeCompanyId,
              company_id: formData.company_id || null,
              employee_id: formData.employee_id,
              amount: parseFloat(formData.amount),
              category: formData.category,
              notes: formData.notes || null,
              receipt_image_url: receiptUrl,
              frequency: recurrenceFrequency,
              interval: recurrenceInterval,
              recurrence_day: recurrenceDay,
            })
            .eq("id", recurringTemplateId)
            .eq("unternehmen_id", activeCompanyId);

          if (error) throw error;
        } else {
          const template = await createRecurringExpense.mutateAsync({
            company_id: formData.company_id || null,
            employee_id: formData.employee_id,
            start_date: formData.expense_date,
            last_generated_date: formData.expense_date,
            amount: parseFloat(formData.amount),
            category: formData.category,
            notes: formData.notes || null,
            receipt_image_url: receiptUrl,
            interval: recurrenceInterval,
            frequency: recurrenceFrequency,
            recurrence_day: recurrenceDay,
            is_active: true
          });
          recurringTemplateId = template?.id || "";
        }
      } else if (formData.recurring_expense_id) {
        await supabase
          .from("recurring_expenses")
          .update({ is_active: false })
          .eq("id", formData.recurring_expense_id)
          .eq("unternehmen_id", activeCompanyId);
        recurringTemplateId = "";
      }

      await updateExpense.mutateAsync({
        id: selectedExpense.id,
        updates: {
          company_id: formData.company_id || null,
          client_id: isSingle ? null : formData.client_id || null,
          employee_id: formData.employee_id,
          expense_date: formData.expense_date,
          amount: parseFloat(formData.amount),
          category: formData.category,
          notes: formData.notes || null,
          is_recurring_monthly: isRecurring && recurrenceFrequency === "monthly",
          recurrence_frequency: isRecurring ? recurrenceFrequency : null,
          recurring_expense_id: isRecurring ? recurringTemplateId : null,
          receipt_image_url: receiptUrl || null,
        },
      });

      setIsEditDialogOpen(false);
      resetForm();
    } catch {
      toast.error("Fehler beim Aktualisieren der Spese");
    } finally {
      setProcessingRecurring(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedExpense) return;
    await deleteExpense.mutateAsync(selectedExpense.id);
    setIsDeleteDialogOpen(false);
    resetForm();
  };

  const openDeleteDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDeleteDialogOpen(true);
  };

  const handleRetryAI = useCallback(async (exp: Expense) => {
    const { error } = await supabase
      .from("expenses")
      .update({ status: "processing" })
      .eq("id", exp.id);
    if (error) {
      toast.error("KI-Analyse konnte nicht gestartet werden", { description: error.message });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
  }, [queryClient]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-CH");
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(amount);
  };

  const getEmployeeName = (expense: ExpenseWithRelations) => {
    const employee = expense.employees;
    if (!employee) return "-";
    const name = `${employee.first_name || ""} ${employee.last_name || ""}`.trim();
    return name || "-";
  };

  const getCompanyName = (expense: ExpenseWithRelations) => {
    return expense.kunden?.name || expense.companies?.name || "-";
  };

  const getClientName = (expense: ExpenseWithRelations) => {
    const c = expense.clients;
    if (!c) return "-";
    return `${c.first_name || ""} ${c.last_name || ""}`.trim() || "-";
  };

  const formatMonthLabel = (monthValue: string) => {
    if (!monthValue) return "Monat wählen";
    const [year, month] = monthValue.split("-");
    if (!year || !month) return monthValue;
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("de-CH", { month: "long", year: "numeric" });
  };

  const filterExpensesByMonth = (items: ExpenseWithRelations[], monthValue: string) => {
    if (!monthValue) return items;
    return items.filter((expense) => (expense.expense_date || "").startsWith(monthValue));
  };

  const filteredExportExpenses = exportScope === "month" && exportMonth
    ? filterExpensesByMonth(exportableExpenses, exportMonth)
    : exportableExpenses;
  const exportRangeLabel = exportScope === "month" ? formatMonthLabel(exportMonth) : "Alle Spesen";

  // Banana-Export Preview: nur completed Spesen, optional Datumsfilter, optional bereits exportiert
  const bananaPreviewExpenses = exportableExpenses.filter((e) => {
    if ((e as ExpenseWithRelations).status && (e as ExpenseWithRelations).status !== "completed") return false;
    const d = e.expense_date ?? "";
    if (bananaDateFrom && d < bananaDateFrom) return false;
    if (bananaDateTo && d > bananaDateTo) return false;
    if (!bananaIncludeExported && (e as ExpenseWithRelations).banana_exported_at) return false;
    return true;
  });
  const bananaGranularityLabel =
    bananaSettings?.banana_export_granularity === "per_receipt"
      ? "Pro Beleg eine Buchung (One-Line)"
      : "Pro Position eine Buchung (Multi-Line)";

  // Buchhaltungs-Export Preview (Non-Banana): completed Spesen im Datumsbereich
  const expenseExportPreview = exportableExpenses.filter((e) => {
    if (
      (e as ExpenseWithRelations).status &&
      (e as ExpenseWithRelations).status !== "completed"
    )
      return false;
    const d = e.expense_date ?? "";
    if (expExportFrom && d < expExportFrom) return false;
    if (expExportTo && d > expExportTo) return false;
    return true;
  });

  const handleBananaExport = async () => {
    if (!activeCompanyId) {
      toast.error("Bitte zuerst ein ERP-Unternehmen auswählen");
      return;
    }
    if (bananaPreviewExpenses.length === 0) {
      toast.error("Keine Spesen für den Banana-Export ausgewählt");
      return;
    }
    try {
      await bananaExportMutation.mutateAsync({
        date_from: bananaDateFrom || undefined,
        date_to: bananaDateTo || undefined,
        include_already_exported: bananaIncludeExported,
      });
      setIsBananaDialogOpen(false);
    } catch {
      // Toast wird vom Hook angezeigt
    }
  };

  const handleExpenseExport = async () => {
    if (expenseExportPreview.length === 0) {
      toast.error("Keine Spesen für den Buchhaltungs-Export im Zeitraum");
      return;
    }
    try {
      await expenseExportMutation.mutateAsync({
        date_from: expExportFrom || undefined,
        date_to: expExportTo || undefined,
      });
      setIsExpenseExportDialogOpen(false);
    } catch {
      // Toast wird vom Hook angezeigt
    }
  };

  const handleExportExpenses = async () => {
    if (!activeCompanyId) {
      toast.error("Bitte zuerst ein ERP-Unternehmen auswählen");
      return;
    }

    if (!exportableExpenses.length) {
      toast.error("Keine Spesen zum Exportieren vorhanden");
      return;
    }

    if (exportScope === "month" && !exportMonth) {
      toast.error("Bitte wählen Sie einen Monat für den Export aus");
      return;
    }

    const itemsToExport = exportScope === "month" && exportMonth
      ? filterExpensesByMonth(exportableExpenses, exportMonth)
      : exportableExpenses;

    if (!itemsToExport.length) {
      toast.error("Für den ausgewählten Monat sind keine Spesen vorhanden");
      return;
    }

    try {
      setIsExporting(true);
      const { generateExpensesPdf, generateExpensesCsv } = await import("@/utils/expenseExport");
      const filename = exportFormat === "csv"
        ? generateExpensesCsv(itemsToExport, {
            monthFilter: exportScope === "month" ? exportMonth : undefined,
          })
        : generateExpensesPdf(itemsToExport, {
            monthFilter: exportScope === "month" ? exportMonth : undefined,
          });
      toast.success(`Export erstellt (${filename})`);
      setIsExportDialogOpen(false);
    } catch {
      toast.error("Export fehlgeschlagen");
    } finally {
      setIsExporting(false);
    }
  };

  const getRecurrenceDayValue = (frequency: string, expenseDate: string, recurrenceDayInput?: string) => {
    if (recurrenceDayInput) {
      return parseInt(recurrenceDayInput, 10);
    }

    const expenseDateObj = new Date(expenseDate);
    if (frequency === "weekly") {
      const jsDay = expenseDateObj.getDay(); // Sunday = 0
      return jsDay === 0 ? 7 : jsDay; // Convert to 1 (Mon) - 7 (Sun)
    }

    return expenseDateObj.getDate();
  };

  const totalAmount = expenses?.reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0) || 0;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Spesen</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Übersicht aller Ausgaben und Spesen</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto items-center">
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
          <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 sm:flex-none">
                <FileDown className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Spesen exportieren</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Spesen exportieren</DialogTitle>
                <DialogDescription>
                  Laden Sie alle erfassten Spesen als PDF oder CSV herunter und filtern Sie bei Bedarf nach Monat.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as "pdf" | "csv")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Umfang</Label>
                  <Select value={exportScope} onValueChange={(value) => setExportScope(value as "all" | "month")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Spesen</SelectItem>
                      <SelectItem value="month">Nach Monat filtern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {exportScope === "month" && (
                  <div className="space-y-2">
                    <Label htmlFor="export-month">Monat</Label>
                    <Input
                      id="export-month"
                      type="month"
                      value={exportMonth}
                      onChange={(e) => setExportMonth(e.target.value)}
                    />
                  </div>
                )}

                <div className="rounded-md border p-3 bg-muted/30 text-sm">
                  <p className="font-medium">{exportRangeLabel}</p>
                  <p className="text-muted-foreground mt-1">
                    Aktuell werden {filteredExportExpenses.length} von {exportableExpenses.length} Spesen exportiert.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleExportExpenses} disabled={isExporting || isLoading}>
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Export läuft...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      {exportFormat === "csv" ? "CSV exportieren" : "PDF exportieren"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Banana Buchhaltung Export – nur wenn pro Mandant aktiviert */}
          {bananaSettings?.banana_export_enabled && (
          <Dialog open={isBananaDialogOpen} onOpenChange={setIsBananaDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 sm:flex-none">
                <FileSpreadsheet className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Banana Export</span>
                <span className="sm:hidden">Banana</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Banana Buchhaltung Export</DialogTitle>
                <DialogDescription>
                  Generiert ein ZIP mit Tab-getrennter Buchungs-Datei + Beleg-Ordner zum Import in Banana Plus.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-md border bg-primary/5 p-3 text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-primary" />
                    <span className="font-medium">Granularität: {bananaGranularityLabel}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Diese Einstellung kannst du in den{" "}
                    <a href="/einstellungen" className="underline hover:text-primary">
                      Einstellungen
                    </a>{" "}
                    ändern.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="banana-date-from">Datum von</Label>
                    <Input
                      id="banana-date-from"
                      type="date"
                      value={bananaDateFrom}
                      onChange={(e) => setBananaDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="banana-date-to">Datum bis</Label>
                    <Input
                      id="banana-date-to"
                      type="date"
                      value={bananaDateTo}
                      onChange={(e) => setBananaDateTo(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="banana-include-exported"
                    checked={bananaIncludeExported}
                    onCheckedChange={(checked) => setBananaIncludeExported(Boolean(checked))}
                  />
                  <Label htmlFor="banana-include-exported" className="text-sm font-normal cursor-pointer">
                    Bereits exportierte Spesen einbeziehen
                  </Label>
                </div>

                <div className="rounded-md border p-3 bg-muted/30 text-sm">
                  <p className="font-medium">
                    {bananaPreviewExpenses.length} Spesen werden exportiert
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Total CHF{" "}
                    {bananaPreviewExpenses
                      .reduce((sum, e) => sum + Number(e.amount ?? 0), 0)
                      .toFixed(2)}
                    {bananaIncludeExported
                      ? " (inkl. bereits exportierter)"
                      : " (nur noch nicht exportierte)"}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsBananaDialogOpen(false)}
                  disabled={bananaExportMutation.isPending}
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleBananaExport}
                  disabled={
                    bananaExportMutation.isPending ||
                    bananaPreviewExpenses.length === 0
                  }
                >
                  {bananaExportMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Export läuft...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      ZIP herunterladen
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          )}
          {/* Buchhaltungs-Export (Treuhaender/Behoerde/Archiv) – nur im Non-Banana-Modus */}
          {!bananaSettings?.banana_export_enabled && (
          <Dialog open={isExpenseExportDialogOpen} onOpenChange={setIsExpenseExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 sm:flex-none">
                <FileSpreadsheet className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Buchhaltungs-Export</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Buchhaltungs-Export</DialogTitle>
                <DialogDescription>
                  Erstellt ein ZIP mit einer Buchungstabelle (eine Zeile pro Kategorie je Beleg) und allen Beleg-Bildern. Jede Zeile verweist auf die zugehörige Beleg-Datei im Paket. Für Treuhänder, Buchhaltung, Steuern und Archiv.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="exp-export-from">Datum von</Label>
                    <Input
                      id="exp-export-from"
                      type="date"
                      value={expExportFrom}
                      onChange={(e) => setExpExportFrom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="exp-export-to">Datum bis</Label>
                    <Input
                      id="exp-export-to"
                      type="date"
                      value={expExportTo}
                      onChange={(e) => setExpExportTo(e.target.value)}
                    />
                  </div>
                </div>

                <div className="rounded-md border p-3 bg-muted/30 text-sm">
                  <p className="font-medium">
                    {expenseExportPreview.length} Spesen werden exportiert
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Total CHF{" "}
                    {expenseExportPreview
                      .reduce((sum, e) => sum + Number(e.amount ?? 0), 0)
                      .toFixed(2)}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsExpenseExportDialogOpen(false)}
                  disabled={expenseExportMutation.isPending}
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleExpenseExport}
                  disabled={
                    expenseExportMutation.isPending ||
                    expenseExportPreview.length === 0
                  }
                >
                  {expenseExportMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Export läuft...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      ZIP herunterladen
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="flex-1 sm:flex-none">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Neue Spese</span>
                <span className="sm:hidden">Neu</span>
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Neue Spese erfassen</DialogTitle>
              <DialogDescription>
                Erfassen Sie eine neue Ausgabe oder Spese
              </DialogDescription>
            </DialogHeader>

            <Tabs value={createTab} onValueChange={setCreateTab} className="w-full mt-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="scan" className="flex items-center gap-2">
                  <ScanLine className="h-4 w-4" />
                  Beleg scannen
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4" />
                  Manuelle Eingabe
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scan" className="space-y-4 mt-4">
                <form onSubmit={handleCreateScan} className="space-y-4">
                  {expenseClientLinkingEnabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className={isSingle ? "col-span-2 space-y-2" : "space-y-2"}>
                        <Label htmlFor="scan-company">Firma</Label>
                        <Select
                          value={formData.company_id}
                          onValueChange={(value) =>
                            setFormData({ ...formData, company_id: value, client_id: "" })
                          }
                        >
                          <SelectTrigger id="scan-company">
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
                      {!isSingle && (
                        <div className="space-y-2">
                          <Label htmlFor="scan-client">Klient</Label>
                          <Select
                            value={formData.client_id}
                            onValueChange={(value) =>
                              setFormData({ ...formData, client_id: value })
                            }
                            disabled={!formData.company_id}
                          >
                            <SelectTrigger id="scan-client">
                              <SelectValue
                                placeholder={
                                  formData.company_id
                                    ? "Klient wählen (optional)"
                                    : "Zuerst Firma wählen"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredClients.map((client) => (
                                <SelectItem key={client.id} value={client.id}>
                                  {client.first_name} {client.last_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="receipt">Beleg (Bild) *</Label>
                    <Input
                      id="receipt"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setImageFile(file);
                      }}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Der Beleg wird automatisch hochgeladen und analysiert. Die extrahierten Daten werden in der Tabelle angezeigt.
                    </p>
                    {uploading && (
                      <div className="text-sm text-muted-foreground">
                        <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                        Wird hochgeladen und analysiert...
                      </div>
                    )}
                    {imageFile && !uploading && (
                      <div className="text-sm text-green-600">
                        Datei ausgewählt: {imageFile.name}
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Wird hochgeladen...
                      </>
                    ) : (
                      "Beleg hochladen"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4 mt-4">
                <form onSubmit={handleCreateManual} className="space-y-4">
                  {expenseClientLinkingEnabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className={isSingle ? "col-span-2 space-y-2" : "space-y-2"}>
                        <Label htmlFor="new-company">Firma</Label>
                        <Select
                          value={formData.company_id}
                          onValueChange={(value) =>
                            setFormData({ ...formData, company_id: value, client_id: "" })
                          }
                        >
                          <SelectTrigger id="new-company">
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
                      {!isSingle && (
                        <div className="space-y-2">
                          <Label htmlFor="new-client">Klient</Label>
                          <Select
                            value={formData.client_id}
                            onValueChange={(value) =>
                              setFormData({ ...formData, client_id: value })
                            }
                            disabled={!formData.company_id}
                          >
                            <SelectTrigger id="new-client">
                              <SelectValue
                                placeholder={
                                  formData.company_id
                                    ? "Klient wählen (optional)"
                                    : "Zuerst Firma wählen"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredClients.map((client) => (
                                <SelectItem key={client.id} value={client.id}>
                                  {client.first_name} {client.last_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="new-employee">Mitarbeiter</Label>
                    <Select value={formData.employee_id} onValueChange={(value) => setFormData({ ...formData, employee_id: value })}>
                      <SelectTrigger id="new-employee">
                        <SelectValue placeholder="Mitarbeiter wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees?.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.first_name} {employee.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-expense-date">Datum *</Label>
                      <Input
                        id="new-expense-date"
                        type="date"
                        value={formData.expense_date}
                        onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-amount">Betrag (CHF) *</Label>
                      <Input
                        id="new-amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-category">Kategorie *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} required>
                      <SelectTrigger id="new-category">
                        <SelectValue placeholder="Kategorie wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-notes">Notizen</Label>
                    <Textarea
                      id="new-notes"
                      rows={3}
                      placeholder="Zusätzliche Informationen..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-receipt">Beleg (optional)</Label>
                    <Input
                      id="new-receipt"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setImageFile(file);
                      }}
                    />
                  </div>
                  <div className="flex flex-col space-y-3 border p-3 rounded-md bg-muted/20">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new-recurring"
                        checked={formData.is_recurring_monthly}
                        onCheckedChange={(checked) => setFormData({
                          ...formData,
                          is_recurring_monthly: checked === true,
                          recurrence_day: checked
                            ? getRecurrenceDayValue(formData.recurrence_frequency, formData.expense_date, formData.recurrence_day).toString()
                            : formData.recurrence_day
                        })}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="new-recurring" className="cursor-pointer font-medium">
                          Wiederkehrende Spese (Abo)
                        </Label>
                      </div>
                    </div>

                    {formData.is_recurring_monthly && (
                      <div className="grid grid-cols-2 gap-4 pt-2 pl-6">
                        <div className="space-y-2">
                          <Label htmlFor="recurrence-frequency">Häufigkeit</Label>
                          <Select
                            value={formData.recurrence_frequency}
                            onValueChange={(value) => setFormData({
                              ...formData,
                              recurrence_frequency: value,
                              recurrence_day: getRecurrenceDayValue(
                                value,
                                formData.expense_date
                              ).toString()
                            })}
                          >
                            <SelectTrigger id="recurrence-frequency">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monatlich</SelectItem>
                              <SelectItem value="weekly">Wöchentlich</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="recurrence-interval">Alle (Interval)</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="recurrence-interval"
                              type="number"
                              min="1"
                              value={formData.recurrence_interval}
                              onChange={(e) => setFormData({ ...formData, recurrence_interval: e.target.value })}
                              className="w-20"
                            />
                            <span className="text-sm text-muted-foreground">
                              {formData.recurrence_frequency === 'monthly' ? 'Monat(e)' : 'Woche(n)'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="recurrence-day">
                            {formData.recurrence_frequency === 'monthly' ? 'Am Tag des Monats' : 'Am Wochentag'}
                          </Label>
                          {formData.recurrence_frequency === 'monthly' ? (
                            <div className="flex items-center gap-2">
                              <Input
                                id="recurrence-day"
                                type="number"
                                min="1"
                                max="31"
                                value={formData.recurrence_day}
                                onChange={(e) => setFormData({ ...formData, recurrence_day: e.target.value })}
                                className="w-20"
                              />
                              <span className="text-sm text-muted-foreground">. Tag</span>
                            </div>
                          ) : (
                            <Select
                              value={formData.recurrence_day}
                              onValueChange={(value) => setFormData({ ...formData, recurrence_day: value })}
                            >
                              <SelectTrigger id="recurrence-day">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Montag</SelectItem>
                                <SelectItem value="2">Dienstag</SelectItem>
                                <SelectItem value="3">Mittwoch</SelectItem>
                                <SelectItem value="4">Donnerstag</SelectItem>
                                <SelectItem value="5">Freitag</SelectItem>
                                <SelectItem value="6">Samstag</SelectItem>
                                <SelectItem value="7">Sonntag</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={createExpense.isPending || uploading || processingRecurring}>
                    {createExpense.isPending || uploading || processingRecurring ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Wird gespeichert...
                      </>
                    ) : (
                      "Spese speichern"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Spesen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totalAmount)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="min-h-[600px]">
        {viewMode === "ordner" && (
          <ExpenseDriveView
            expenses={expenses ?? []}
            categoriesMeta={categoriesMeta}
            onEdit={handleEdit}
            onDelete={(e) => openDeleteDialog(e)}
            onRetryAI={handleRetryAI}
          />
        )}

        {viewMode === "liste" && (
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Alle Spesen</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : expenses && expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Datum</TableHead>
                    <TableHead className="hidden md:table-cell whitespace-nowrap">Mitarbeiter</TableHead>
                    <TableHead className="hidden lg:table-cell whitespace-nowrap">Firma</TableHead>
                    {expenseClientLinkingEnabled && !isSingle && (
                      <TableHead className="hidden lg:table-cell whitespace-nowrap">Klient</TableHead>
                    )}
                    <TableHead className="hidden sm:table-cell whitespace-nowrap">Kategorie</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Betrag</TableHead>
                    <TableHead className="hidden xl:table-cell">Notizen</TableHead>
                    <TableHead className="hidden md:table-cell whitespace-nowrap">Beleg</TableHead>
                    <TableHead className="hidden lg:table-cell whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => {
                    const recurrenceFrequency = expense.recurrence_frequency || (expense.is_recurring_monthly ? "monthly" : null);

                    return (
                      <TableRow key={expense.id}>
                        <TableCell className="whitespace-nowrap">{formatDate(expense.expense_date)}</TableCell>
                        <TableCell className="hidden md:table-cell whitespace-nowrap">
                          {getEmployeeName(expense as ExpenseWithRelations)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell whitespace-nowrap">{getCompanyName(expense as ExpenseWithRelations)}</TableCell>
                        {expenseClientLinkingEnabled && !isSingle && (
                          <TableCell className="hidden lg:table-cell whitespace-nowrap">{getClientName(expense as ExpenseWithRelations)}</TableCell>
                        )}
                        <TableCell className="hidden sm:table-cell whitespace-nowrap">{expense.category}</TableCell>
                        <TableCell className="text-right font-medium whitespace-nowrap">
                          {formatAmount(parseFloat(expense.amount.toString()))}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-muted-foreground text-sm max-w-[200px] truncate">
                          {expense.notes || "-"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {expense.receipt_image_url ? (
                            <a
                              href={expense.receipt_image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Beleg
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {expense.ai_model_used || expense.imported_via_bono ? (
                            <Badge variant="secondary">Automatisch</Badge>
                          ) : (
                            <Badge variant="outline">Manuell</Badge>
                          )}
                          {recurrenceFrequency && (
                            <Badge variant="default" className="ml-2">
                              {recurrenceFrequency === "weekly" ? "Wöchentlich" : "Monatlich"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 sm:gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(expense)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(expense)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Keine Spesen vorhanden. Erstellen Sie Ihre erste Spese.
            </div>
          )}
        </CardContent>
      </Card>
      )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Spese bearbeiten</DialogTitle>
            <DialogDescription>
              Aktualisieren Sie die Details der Spese
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-4">
            {expenseClientLinkingEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className={isSingle ? "col-span-2 space-y-2" : "space-y-2"}>
                  <Label htmlFor="edit-company">Firma</Label>
                  <Select
                    value={formData.company_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, company_id: value, client_id: "" })
                    }
                  >
                    <SelectTrigger id="edit-company">
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
                {!isSingle && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-client">Klient</Label>
                    <Select
                      value={formData.client_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, client_id: value })
                      }
                      disabled={!formData.company_id}
                    >
                      <SelectTrigger id="edit-client">
                        <SelectValue
                          placeholder={
                            formData.company_id
                              ? "Klient wählen (optional)"
                              : "Zuerst Firma wählen"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredClients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.first_name} {client.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-employee">Mitarbeiter</Label>
              <Select value={formData.employee_id} onValueChange={(value) => setFormData({ ...formData, employee_id: value })}>
                <SelectTrigger id="edit-employee">
                  <SelectValue placeholder="Mitarbeiter wählen" />
                </SelectTrigger>
                <SelectContent>
                  {employees?.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-expense-date">Datum *</Label>
                <Input
                  id="edit-expense-date"
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Betrag (CHF) *</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Kategorie *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} required>
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notizen</Label>
              <Textarea
                id="edit-notes"
                rows={3}
                placeholder="Zusätzliche Informationen..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-receipt">Beleg (Bild) {formData.receipt_image_url && "(Neues Bild überschreibt altes)"}</Label>
              {formData.receipt_image_url && !imageFile && (
                <div className="mb-2">
                  <a
                    href={formData.receipt_image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Aktueller Beleg anzeigen
                  </a>
                </div>
              )}
              <Input
                id="edit-receipt"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setImageFile(file);
                }}
              />
              {uploading && (
                <div className="text-sm text-muted-foreground">
                  <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                  Wird hochgeladen...
                </div>
              )}
              {imageFile && !uploading && (
                <div className="text-sm text-green-600">
                  Neue Datei ausgewählt: {imageFile.name}
                </div>
              )}
            </div>

            {selectedExpense?.id &&
              (bananaSettings?.banana_export_enabled ||
                settings?.expense_line_items_enabled) && (
                <ExpenseLineItemsEditor
                  expenseId={selectedExpense.id}
                  expenseAmount={parseFloat(formData.amount) || 0}
                  bananaEnabled={!!bananaSettings?.banana_export_enabled}
                />
              )}

            <div className="flex flex-col space-y-3 border p-3 rounded-md bg-muted/20">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-recurring"
                  checked={formData.is_recurring_monthly}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    is_recurring_monthly: checked === true,
                    recurrence_day: checked
                      ? getRecurrenceDayValue(formData.recurrence_frequency, formData.expense_date, formData.recurrence_day).toString()
                      : formData.recurrence_day
                  })}
                />
                <Label htmlFor="edit-recurring" className="cursor-pointer">
                  Wiederkehrende Spese (Abo)
                </Label>
              </div>

              {formData.is_recurring_monthly && (
                <div className="grid grid-cols-2 gap-4 pt-2 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="edit-recurrence-frequency">Häufigkeit</Label>
                    <Select
                      value={formData.recurrence_frequency}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        recurrence_frequency: value,
                        recurrence_day: getRecurrenceDayValue(
                          value,
                          formData.expense_date
                        ).toString()
                      })}
                    >
                      <SelectTrigger id="edit-recurrence-frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monatlich</SelectItem>
                        <SelectItem value="weekly">Wöchentlich</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-recurrence-interval">Alle (Interval)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="edit-recurrence-interval"
                        type="number"
                        min="1"
                        value={formData.recurrence_interval}
                        onChange={(e) => setFormData({ ...formData, recurrence_interval: e.target.value })}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        {formData.recurrence_frequency === 'monthly' ? 'Monat(e)' : 'Woche(n)'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="edit-recurrence-day">
                      {formData.recurrence_frequency === 'monthly' ? 'Am Tag des Monats' : 'Am Wochentag'}
                    </Label>
                    {formData.recurrence_frequency === 'monthly' ? (
                      <div className="flex items-center gap-2">
                        <Input
                          id="edit-recurrence-day"
                          type="number"
                          min="1"
                          max="31"
                          value={formData.recurrence_day}
                          onChange={(e) => setFormData({ ...formData, recurrence_day: e.target.value })}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">. Tag</span>
                      </div>
                    ) : (
                      <Select
                        value={formData.recurrence_day}
                        onValueChange={(value) => setFormData({ ...formData, recurrence_day: value })}
                      >
                        <SelectTrigger id="edit-recurrence-day">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Montag</SelectItem>
                          <SelectItem value="2">Dienstag</SelectItem>
                          <SelectItem value="3">Mittwoch</SelectItem>
                          <SelectItem value="4">Donnerstag</SelectItem>
                          <SelectItem value="5">Freitag</SelectItem>
                          <SelectItem value="6">Samstag</SelectItem>
                          <SelectItem value="7">Sonntag</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={updateExpense.isPending || uploading || processingRecurring}>
              {updateExpense.isPending || uploading || processingRecurring ? (
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
            <AlertDialogTitle>Spese löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diese Spese vom <strong>{selectedExpense && formatDate(selectedExpense.expense_date)}</strong> über{" "}
              <strong>{selectedExpense && formatAmount(parseFloat(selectedExpense.amount.toString()))}</strong> wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={resetForm}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteExpense.isPending}
            >
              {deleteExpense.isPending ? (
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

export default Spesen;
