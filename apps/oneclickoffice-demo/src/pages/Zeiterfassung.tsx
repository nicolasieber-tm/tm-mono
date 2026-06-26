import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Plus, Pencil, Trash2, Loader2, FileCheck2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTimeEntries, useCreateTimeEntry, useUpdateTimeEntry, useDeleteTimeEntry } from "@/hooks/useTimeEntries";
import { useKunden } from "@/hooks/useKunden";
import { useClients } from "@/hooks/useClients";
import { useEmployees } from "@/hooks/useEmployees";
import { useAuth } from "@/contexts/AuthContext";
import { useIsSingleLevel } from "@/hooks/useClientHierarchyMode";
import { Database } from "@/integrations/supabase/types";
import { calculateDistance, calculateTravelExpense } from "@/utils/distanceCalculator";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { CategoryManager } from "@/components/CategoryManager";
import { useTimeEntryCategories } from "@/hooks/useTimeEntryCategories";

type TimeEntry = Database["public"]["Tables"]["time_entries"]["Row"];
type TimeEntryWithRelations = TimeEntry & {
  kunden?: { name: string } | null;
  companies?: { name: string } | null;
  clients?: { first_name: string; last_name: string } | null;
  employees?: { first_name: string; last_name: string } | null;
  invoices?: { invoice_number: string; created_at: string } | null;
};
type ClientWithRelations = Database["public"]["Tables"]["clients"]["Row"] & {
  kunden?: { name: string } | null;
  email?: string;
};

const Zeiterfassung = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [showTravelFields, setShowTravelFields] = useState(false);

  const [formData, setFormData] = useState({
    company_id: "",
    client_id: "",
    employee_id: "",
    date: "",
    start_time: "",
    end_time: "",
    total_hours: 0,
    activity_description: "",
    category: "",
    travel_from: "",
    travel_to: "",
    travel_distance_km: 0,
    travel_expense_amount: 0,
  });

  const { user } = useAuth();
  const isSingle = useIsSingleLevel();
  const { data: timeEntries, isLoading } = useTimeEntries();
  const { data: companies } = useKunden();
  const { data: clients } = useClients();
  const { data: employees } = useEmployees();
  const { data: categories } = useTimeEntryCategories();
  const createEntry = useCreateTimeEntry();
  const updateEntry = useUpdateTimeEntry();
  const deleteEntry = useDeleteTimeEntry();
  const [filterCompanyId, setFilterCompanyId] = useState("all");
  const [filterClientId, setFilterClientId] = useState("all");
  const [filterEmployeeId, setFilterEmployeeId] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterInvoiceStatus, setFilterInvoiceStatus] = useState("all");
  const monthlyCategoryKeys = new Set(["kurzkontakte ganzer monat"]);
  const isMonthlyCategory = monthlyCategoryKeys.has(formData.category.trim().toLowerCase());
  const getMonthValue = (dateValue: string) => (dateValue ? dateValue.slice(0, 7) : "");

  // Filter clients by selected company
  const filteredClients = clients?.filter(
    (client) => client.company_id === formData.company_id
  ) || [];

  const filterClients = useMemo(() => {
    if (!clients) return [];
    if (filterCompanyId === "all") return clients;
    return clients.filter((client) => client.company_id === filterCompanyId);
  }, [clients, filterCompanyId]);

  const yearOptions = useMemo(() => {
    if (!timeEntries?.length) return [];
    const years = new Set(timeEntries.map((entry) => entry.date.split("-")[0]));
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [timeEntries]);

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const value = String(index + 1).padStart(2, "0");
      const label = new Date(2000, index, 1).toLocaleDateString("de-CH", {
        month: "long",
      });
      return { value, label };
    });
  }, []);

  const filteredTimeEntries = useMemo(() => {
    if (!timeEntries) return [];
    return timeEntries.filter((entry) => {
      if (filterCompanyId !== "all" && entry.company_id !== filterCompanyId) {
        return false;
      }
      if (filterClientId !== "all" && entry.client_id !== filterClientId) {
        return false;
      }
      if (filterEmployeeId !== "all" && entry.employee_id !== filterEmployeeId) {
        return false;
      }
      const [entryYear, entryMonth] = entry.date.split("-");
      if (filterYear !== "all" && entryYear !== filterYear) {
        return false;
      }
      if (filterMonth !== "all" && entryMonth !== filterMonth) {
        return false;
      }
      if (filterInvoiceStatus !== "all") {
        const billed = !!(entry as TimeEntryWithRelations).is_billed || !!(entry as TimeEntryWithRelations).invoice_id;
        if (filterInvoiceStatus === "unbilled" && billed) return false;
        if (filterInvoiceStatus === "billed" && !billed) return false;
      }
      return true;
    });
  }, [filterClientId, filterCompanyId, filterEmployeeId, filterInvoiceStatus, filterMonth, filterYear, timeEntries]);

  const [globalKmRate, setGlobalKmRate] = useState(0.70);
  const distanceCalcTimeoutRef = useRef<NodeJS.Timeout>();

  // Load global km_rate from localStorage
  useEffect(() => {
    const savedKmRate = localStorage.getItem('global_km_rate');
    if (savedKmRate) {
      setGlobalKmRate(parseFloat(savedKmRate));
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (distanceCalcTimeoutRef.current) {
        clearTimeout(distanceCalcTimeoutRef.current);
      }
    };
  }, []);

  const formatEndTimeFromDuration = (hours: number) => {
    const totalMinutes = Math.max(1, Math.round(hours * 60));
    const clampedMinutes = Math.min(totalMinutes, 23 * 60 + 59);
    const h = Math.floor(clampedMinutes / 60)
      .toString()
      .padStart(2, "0");
    const m = (clampedMinutes % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const handleTravelChange = (field: 'from' | 'to', value: string) => {
    const newFormData = {
      ...formData,
      [`travel_${field}`]: value,
    };

    // Update form data immediately
    setFormData(newFormData);

    // Clear previous timeout
    if (distanceCalcTimeoutRef.current) {
      clearTimeout(distanceCalcTimeoutRef.current);
    }

    // Only calculate distance if both fields are filled
    if (newFormData.travel_from && newFormData.travel_to) {
      // Debounce the distance calculation (wait 1 second after user stops typing)
      distanceCalcTimeoutRef.current = setTimeout(async () => {
        const distance = await calculateDistance(
          newFormData.travel_from,
          newFormData.travel_to
        );

        if (distance) {
          // Use global km_rate from localStorage
          setFormData(prev => ({
            ...prev,
            travel_distance_km: distance,
            travel_expense_amount: calculateTravelExpense(distance, globalKmRate)
          }));
        }
      }, 1000); // 1 second debounce
    } else {
      // Reset distance and expense if either field is empty
      setFormData(prev => ({
        ...prev,
        travel_distance_km: 0,
        travel_expense_amount: 0
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      company_id: "",
      client_id: "",
      employee_id: user?.id || "",
      date: "",
      start_time: "",
      end_time: "",
      total_hours: 0,
      activity_description: "",
      category: "",
      travel_from: "",
      travel_to: "",
      travel_distance_km: 0,
      travel_expense_amount: 0,
    });
    setSelectedEntry(null);
    setShowTravelFields(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const hours = Number(formData.total_hours) || 0;
    const derivedStartTime = "00:00";
    const derivedEndTime = formatEndTimeFromDuration(hours);
    const entryDate =
      isMonthlyCategory && formData.date
        ? `${formData.date.slice(0, 7)}-01`
        : formData.date;
    await createEntry.mutateAsync({
      ...formData,
      client_id: isSingle ? null : formData.client_id,
      date: entryDate,
      total_hours: hours,
      start_time: derivedStartTime,
      end_time: derivedEndTime,
      employee_id: user?.id || formData.employee_id,
    });
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEdit = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setFormData({
      company_id: entry.company_id,
      client_id: entry.client_id,
      employee_id: entry.employee_id,
      date: entry.date,
      start_time: entry.start_time,
      end_time: entry.end_time,
      total_hours: entry.total_hours,
      activity_description: entry.activity_description || "",
      category: entry.category || "",
      travel_from: entry.travel_from || "",
      travel_to: entry.travel_to || "",
      travel_distance_km: entry.travel_distance_km || 0,
      travel_expense_amount: entry.travel_expense_amount || 0,
    });
    setShowTravelFields(!!(entry.travel_from || entry.travel_to));
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;
    const hours = Number(formData.total_hours) || 0;
    const derivedStartTime = "00:00";
    const derivedEndTime = formatEndTimeFromDuration(hours);
    const entryDate =
      isMonthlyCategory && formData.date
        ? `${formData.date.slice(0, 7)}-01`
        : formData.date;
    await updateEntry.mutateAsync({
      id: selectedEntry.id,
      updates: {
        ...formData,
        client_id: isSingle ? null : formData.client_id,
        date: entryDate,
        total_hours: hours,
        start_time: derivedStartTime,
        end_time: derivedEndTime,
      },
    });
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (!selectedEntry) return;
    await deleteEntry.mutateAsync(selectedEntry.id);
    setIsDeleteDialogOpen(false);
    resetForm();
  };

  const openDeleteDialog = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-CH');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Zeiterfassung</h1>
          <p className="text-muted-foreground mt-1">Übersicht aller erfassten Arbeitszeiten</p>
        </div>
        <div className="flex gap-2">
          <CategoryManager />
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Neuer Zeiteintrag
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Neuer Zeiteintrag</DialogTitle>
                <DialogDescription>
                  Erfassen Sie einen neuen Arbeitseinsatz
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className={isSingle ? "col-span-2 space-y-2" : "space-y-2"}>
                    <Label htmlFor="company">Firma *</Label>
                    <Select
                      value={formData.company_id}
                      onValueChange={(value) => setFormData({ ...formData, company_id: value, client_id: "" })}
                      required
                    >
                      <SelectTrigger id="company">
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
                  {!isSingle && (
                    <div className="space-y-2">
                      <Label htmlFor="client">Klient *</Label>
                      <Select
                        value={formData.client_id}
                        onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                        required
                        disabled={!formData.company_id}
                      >
                        <SelectTrigger id="client">
                          <SelectValue placeholder={formData.company_id ? "Klient wählen" : "Zuerst Firma wählen"} />
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
                <div className="space-y-2">
                  <Label htmlFor="date">
                    {isMonthlyCategory ? "Monat" : "Datum"} *
                  </Label>
                  {isMonthlyCategory ? (
                    <Input
                      id="date"
                      type="month"
                      value={getMonthValue(formData.date)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          date: e.target.value ? `${e.target.value}-01` : "",
                        })
                      }
                      required
                    />
                  ) : (
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Dauer (Stunden) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    inputMode="decimal"
                    min="0.25"
                    step="0.25"
                    value={formData.total_hours || ""}
                    onChange={(e) => setFormData({ ...formData, total_hours: Number(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Aktivität/Beschreibung</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    placeholder="z.B. Begleitung Arzttermin, Einkaufsbegleitung..."
                    value={formData.activity_description}
                    onChange={(e) => setFormData({ ...formData, activity_description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategorie (Interne Rapportierung)</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Kategorie wählen (optional)" />
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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="add-travel"
                    checked={showTravelFields}
                    onCheckedChange={(checked) => setShowTravelFields(checked === true)}
                  />
                  <Label htmlFor="add-travel" className="cursor-pointer">Fahrt hinzufügen</Label>
                </div>
                {showTravelFields && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="travel-from">Fahrt von</Label>
                        <AddressAutocomplete
                          id="travel-from"
                          value={formData.travel_from}
                          onChange={(value) => handleTravelChange('from', value)}
                          placeholder="z.B. Zürich, Bahnhofstrasse 1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="travel-to">Fahrt nach</Label>
                        <AddressAutocomplete
                          id="travel-to"
                          value={formData.travel_to}
                          onChange={(value) => handleTravelChange('to', value)}
                          placeholder="z.B. Bern, Bundesplatz"
                        />
                      </div>
                    </div>
                    {formData.travel_distance_km > 0 && (
                      <div className="p-3 bg-muted rounded-lg space-y-1">
                        <p className="text-sm">
                          <strong>Distanz:</strong> {formData.travel_distance_km.toFixed(1)} km
                        </p>
                        <p className="text-sm">
                          <strong>Fahrspesen:</strong> CHF {formData.travel_expense_amount.toFixed(2)}
                          <span className="text-muted-foreground ml-2">
                            (à CHF {globalKmRate.toFixed(2)}/km)
                          </span>
                        </p>
                      </div>
                    )}
                  </>
                )}
                <Button type="submit" className="w-full" disabled={createEntry.isPending}>
                  {createEntry.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird erstellt...
                    </>
                  ) : (
                    "Zeiteintrag erstellen"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zeiteinträge</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-lg border bg-muted/30 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3 items-end">
              <div className="space-y-1.5">
                <Label htmlFor="time-entry-filter-company" className="text-xs font-medium text-muted-foreground">Firma</Label>
                <Select
                  value={filterCompanyId}
                  onValueChange={(value) => {
                    setFilterCompanyId(value);
                    setFilterClientId("all");
                  }}
                >
                  <SelectTrigger id="time-entry-filter-company">
                    <SelectValue placeholder="Alle Firmen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Firmen</SelectItem>
                    {companies?.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time-entry-filter-client" className="text-xs font-medium text-muted-foreground">Klient</Label>
                <Select value={filterClientId} onValueChange={setFilterClientId}>
                  <SelectTrigger id="time-entry-filter-client">
                    <SelectValue placeholder="Alle Klienten" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Klienten</SelectItem>
                    {filterClients.map((client) => {
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
              <div className="space-y-1.5">
                <Label htmlFor="time-entry-filter-employee" className="text-xs font-medium text-muted-foreground">Mitarbeiter</Label>
                <Select value={filterEmployeeId} onValueChange={setFilterEmployeeId}>
                  <SelectTrigger id="time-entry-filter-employee">
                    <SelectValue placeholder="Alle Mitarbeiter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Mitarbeiter</SelectItem>
                    {employees?.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time-entry-filter-year" className="text-xs font-medium text-muted-foreground">Jahr</Label>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger id="time-entry-filter-year">
                    <SelectValue placeholder="Alle Jahre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Jahre</SelectItem>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time-entry-filter-month" className="text-xs font-medium text-muted-foreground">Monat</Label>
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger id="time-entry-filter-month">
                    <SelectValue placeholder="Alle Monate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Monate</SelectItem>
                    {monthOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time-entry-filter-invoice" className="text-xs font-medium text-muted-foreground">Rechnung</Label>
                <Select value={filterInvoiceStatus} onValueChange={setFilterInvoiceStatus}>
                  <SelectTrigger id="time-entry-filter-invoice">
                    <SelectValue placeholder="Alle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="unbilled">Nur offene (ohne Rechnung)</SelectItem>
                    <SelectItem value="billed">Nur verrechnete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(filterCompanyId !== "all" ||
                filterClientId !== "all" ||
                filterEmployeeId !== "all" ||
                filterYear !== "all" ||
                filterMonth !== "all" ||
                filterInvoiceStatus !== "all") && (
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setFilterCompanyId("all");
                      setFilterClientId("all");
                      setFilterEmployeeId("all");
                      setFilterYear("all");
                      setFilterMonth("all");
                      setFilterInvoiceStatus("all");
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
          ) : filteredTimeEntries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Mitarbeiter</TableHead>
                  <TableHead>Firma</TableHead>
                  <TableHead>Klient</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead className="text-right">Stunden</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                  <TableHead className="text-center w-16">Rechnung</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTimeEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell>
                      {(entry as TimeEntryWithRelations).employees
                        ? `${(entry as TimeEntryWithRelations).employees!.first_name} ${(entry as TimeEntryWithRelations).employees!.last_name}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {(entry as TimeEntryWithRelations).kunden?.name || (entry as TimeEntryWithRelations).companies?.name || "-"}
                    </TableCell>
                    <TableCell>
                      {(entry as TimeEntryWithRelations).clients
                        ? `${(entry as TimeEntryWithRelations).clients!.first_name} ${(entry as TimeEntryWithRelations).clients!.last_name}`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {entry.category ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                          {entry.category}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {entry.activity_description || "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {entry.total_hours}h
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(entry)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(entry)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {entry.is_billed && (entry as TimeEntryWithRelations).invoices ? (
                        <Tooltip delayDuration={150}>
                          <TooltipTrigger asChild>
                            <span className="inline-flex cursor-help">
                              <FileCheck2 className="h-4 w-4 text-green-600" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            Rechnung {(entry as TimeEntryWithRelations).invoices!.invoice_number}
                            {" vom "}
                            {formatDate((entry as TimeEntryWithRelations).invoices!.created_at)}
                          </TooltipContent>
                        </Tooltip>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Keine Zeiteinträge gefunden.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Zeiteintrag bearbeiten</DialogTitle>
            <DialogDescription>
              Aktualisieren Sie den Arbeitseinsatz
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className={isSingle ? "col-span-2 space-y-2" : "space-y-2"}>
                <Label htmlFor="edit-company">Firma *</Label>
                <Select
                  value={formData.company_id}
                  onValueChange={(value) => setFormData({ ...formData, company_id: value, client_id: "" })}
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
              {!isSingle && (
                <div className="space-y-2">
                  <Label htmlFor="edit-client">Klient *</Label>
                  <Select
                    value={formData.client_id}
                    onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                    required
                    disabled={!formData.company_id}
                  >
                    <SelectTrigger id="edit-client">
                      <SelectValue placeholder={formData.company_id ? "Klient wählen" : "Zuerst Firma wählen"} />
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
            <div className="space-y-2">
              <Label htmlFor="edit-date">
                {isMonthlyCategory ? "Monat" : "Datum"} *
              </Label>
              {isMonthlyCategory ? (
                <Input
                  id="edit-date"
                  type="month"
                  value={getMonthValue(formData.date)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      date: e.target.value ? `${e.target.value}-01` : "",
                    })
                  }
                  required
                />
              ) : (
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-duration">Dauer (Stunden) *</Label>
              <Input
                id="edit-duration"
                type="number"
                inputMode="decimal"
                min="0.25"
                step="0.25"
                value={formData.total_hours || ""}
                onChange={(e) => setFormData({ ...formData, total_hours: Number(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Aktivität/Beschreibung</Label>
              <Textarea
                id="edit-description"
                rows={3}
                placeholder="z.B. Begleitung Arzttermin, Einkaufsbegleitung..."
                value={formData.activity_description}
                onChange={(e) => setFormData({ ...formData, activity_description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Kategorie (Interne Rapportierung)</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Kategorie wählen (optional)" />
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-add-travel"
                checked={showTravelFields}
                onCheckedChange={(checked) => setShowTravelFields(checked === true)}
              />
              <Label htmlFor="edit-add-travel" className="cursor-pointer">Fahrt hinzufügen</Label>
            </div>
            {showTravelFields && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-travel-from">Fahrt von</Label>
                    <AddressAutocomplete
                      id="edit-travel-from"
                      value={formData.travel_from}
                      onChange={(value) => handleTravelChange('from', value)}
                      placeholder="z.B. Zürich, Bahnhofstrasse 1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-travel-to">Fahrt nach</Label>
                    <AddressAutocomplete
                      id="edit-travel-to"
                      value={formData.travel_to}
                      onChange={(value) => handleTravelChange('to', value)}
                      placeholder="z.B. Bern, Bundesplatz"
                    />
                  </div>
                </div>
                {formData.travel_distance_km > 0 && (
                  <div className="p-3 bg-muted rounded-lg space-y-1">
                    <p className="text-sm">
                      <strong>Distanz:</strong> {formData.travel_distance_km.toFixed(1)} km
                    </p>
                    <p className="text-sm">
                      <strong>Fahrspesen:</strong> CHF {formData.travel_expense_amount.toFixed(2)}
                      <span className="text-muted-foreground ml-2">
                        (à CHF {globalKmRate.toFixed(2)}/km)
                      </span>
                    </p>
                  </div>
                )}
              </>
            )}
            <Button type="submit" className="w-full" disabled={updateEntry.isPending}>
              {updateEntry.isPending ? (
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
            <AlertDialogTitle>Zeiteintrag löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diesen Zeiteintrag wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={resetForm}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteEntry.isPending}
            >
              {deleteEntry.isPending ? (
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

export default Zeiterfassung;
