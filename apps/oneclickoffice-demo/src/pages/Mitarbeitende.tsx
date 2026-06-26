import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Pencil, Trash2, Loader2, Plus } from "lucide-react";
import { useEmployees, useUpdateEmployee, useDeleteEmployee } from "@/hooks/useEmployees";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";
import { DemoFieldset, DemoReadOnlyNotice } from "@/components/demo/DemoChrome";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Employee = Database["public"]["Tables"]["employees"]["Row"];

const Mitarbeitende = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    hourly_rate: 0,
  });

  const [inviteFormData, setInviteFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    hourly_rate: "",
  });

  const [globalKmRate, setGlobalKmRate] = useState(0.70);

  const queryClient = useQueryClient();
  const { activeCompanyId } = useActiveCompany();
  const { data: employees, isLoading } = useEmployees();
  const { data: timeEntries, isLoading: isTimeEntriesLoading } = useTimeEntries();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const [isInviting, setIsInviting] = useState(false);

  // Load global km_rate from localStorage on mount
  useEffect(() => {
    const savedKmRate = localStorage.getItem('global_km_rate');
    if (savedKmRate) {
      setGlobalKmRate(parseFloat(savedKmRate));
    }
  }, []);

  const saveGlobalKmRate = () => {
    localStorage.setItem('global_km_rate', globalKmRate.toString());
    toast.success('Preis pro km gespeichert');
  };

  const resetForm = () => {
    setFormData({ first_name: "", last_name: "", phone: "", hourly_rate: 0 });
    setSelectedEmployee(null);
  };

  const resetInviteForm = () => {
    setInviteFormData({ email: "", first_name: "", last_name: "", hourly_rate: "" });
  };

  const handleInviteEmployee = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!activeCompanyId) {
      toast.error("Bitte zuerst ein ERP-Unternehmen auswählen");
      return;
    }

    const email = inviteFormData.email.trim();
    const firstName = inviteFormData.first_name.trim();
    const lastName = inviteFormData.last_name.trim();
    const hourlyRate = Number(inviteFormData.hourly_rate);

    if (!email || !firstName || !lastName) {
      toast.error("Bitte alle Pflichtfelder ausfüllen");
      return;
    }

    if (Number.isNaN(hourlyRate) || hourlyRate < 0) {
      toast.error("Bitte einen gültigen Stundensatz eingeben");
      return;
    }

    setIsInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke("invite-employee", {
        body: {
          email,
          firstName,
          lastName,
          hourlyRate,
          unternehmenId: activeCompanyId,
        },
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || "Einladung fehlgeschlagen");
      }

      toast.success("Einladung wurde versendet");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsInviteDialogOpen(false);
      resetInviteForm();
    } catch (inviteError) {
      const message =
        inviteError instanceof Error ? inviteError.message : "Einladung fehlgeschlagen";
      toast.error("Fehler beim Einladen", { description: message });
    } finally {
      setIsInviting(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      phone: employee.phone || "",
      hourly_rate: employee.hourly_rate,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    await updateEmployee.mutateAsync({ id: selectedEmployee.id, updates: formData });
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;
    await deleteEmployee.mutateAsync(selectedEmployee.id);
    setIsDeleteDialogOpen(false);
    resetForm();
  };

  const openDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString("de-CH", { year: "numeric", month: "long" });
      options.push({ value, label });
    }
    return options;
  }, []);

  const weekRange = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(now.getDate() + diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, []);

  const weekLabel = useMemo(() => {
    const format = (date: Date) =>
      date.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit" });
    return `${format(weekRange.start)}–${format(weekRange.end)}`;
  }, [weekRange]);

  const monthTimeEntries = useMemo(() => {
    if (!timeEntries || !selectedMonth) return [];

    const [year, month] = selectedMonth.split("-").map(Number);
    return timeEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === year && entryDate.getMonth() + 1 === month;
    });
  }, [timeEntries, selectedMonth]);

  const weekTimeEntries = useMemo(() => {
    if (!timeEntries) return [];

    return timeEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= weekRange.start && entryDate <= weekRange.end;
    });
  }, [timeEntries, weekRange]);

  const monthHoursByEmployee = useMemo(() => {
    return monthTimeEntries.reduce<Record<string, number>>((totals, entry) => {
      if (!entry.employee_id) return totals;
      totals[entry.employee_id] = (totals[entry.employee_id] || 0) + (entry.total_hours || 0);
      return totals;
    }, {});
  }, [monthTimeEntries]);

  const weekHoursByEmployee = useMemo(() => {
    return weekTimeEntries.reduce<Record<string, number>>((totals, entry) => {
      if (!entry.employee_id) return totals;
      totals[entry.employee_id] = (totals[entry.employee_id] || 0) + (entry.total_hours || 0);
      return totals;
    }, {});
  }, [weekTimeEntries]);

  return (
    <DemoFieldset>
    <div className="p-6 space-y-6">
      <DemoReadOnlyNotice title="Mitarbeitende" />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Einstellungen</h1>
          <p className="text-muted-foreground mt-1">Mitarbeitende und globale Einstellungen</p>
        </div>
      </div>

      <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Alle Mitarbeitende</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Arbeitsstunden pro Monat · Woche {weekLabel}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="w-full sm:w-64">
              <Label htmlFor="employee-month" className="sr-only">
                Monat
              </Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger id="employee-month">
                  <SelectValue placeholder="Monat wählen" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" onClick={() => setIsInviteDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Mitarbeiter einladen
            </Button>
          </div>
        </div>
      </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : employees && employees.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vorname</TableHead>
                  <TableHead>Nachname</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead className="text-right">Arbeitsstunden</TableHead>
                  <TableHead className="text-right">Stundensatz (CHF/h)</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.first_name}</TableCell>
                    <TableCell>{employee.last_name}</TableCell>
                    <TableCell>{employee.phone || "-"}</TableCell>
                    <TableCell className="text-right">
                      {isTimeEntriesLoading ? (
                        <Loader2 className="ml-auto h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <div className="flex flex-col items-end">
                          <span>{(monthHoursByEmployee[employee.id] || 0).toFixed(2)} h</span>
                          <span className="text-xs text-muted-foreground">
                            Woche: {(weekHoursByEmployee[employee.id] || 0).toFixed(2)} h
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      CHF {employee.hourly_rate.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleEdit(employee);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(event) => {
                            event.stopPropagation();
                            openDeleteDialog(employee);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Keine Mitarbeitende vorhanden.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog
        open={isInviteDialogOpen}
        onOpenChange={(open) => {
          setIsInviteDialogOpen(open);
          if (!open) resetInviteForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mitarbeiter einladen</DialogTitle>
            <DialogDescription>
              Der Mitarbeitende erhält eine E-Mail und setzt sein Passwort selbst.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteEmployee} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">E-Mail *</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="name@firma.ch"
                value={inviteFormData.email}
                onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invite-first-name">Vorname *</Label>
                <Input
                  id="invite-first-name"
                  placeholder="Maria"
                  value={inviteFormData.first_name}
                  onChange={(e) => setInviteFormData({ ...inviteFormData, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-last-name">Nachname *</Label>
                <Input
                  id="invite-last-name"
                  placeholder="Schneider"
                  value={inviteFormData.last_name}
                  onChange={(e) => setInviteFormData({ ...inviteFormData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-hourly-rate">Stundenansatz (CHF/h) *</Label>
              <Input
                id="invite-hourly-rate"
                type="number"
                step="0.50"
                placeholder="45.00"
                value={inviteFormData.hourly_rate}
                onChange={(e) =>
                  setInviteFormData({ ...inviteFormData, hourly_rate: e.target.value })
                }
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isInviting}>
              {isInviting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Einladung wird gesendet...
                </>
              ) : (
                "Einladung senden"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mitarbeiter bearbeiten</DialogTitle>
            <DialogDescription>
              Aktualisieren Sie die Daten des Mitarbeiters
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-first-name">Vorname *</Label>
                <Input
                  id="edit-first-name"
                  placeholder="Maria"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-last-name">Nachname *</Label>
                <Input
                  id="edit-last-name"
                  placeholder="Schneider"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefon</Label>
              <Input
                id="edit-phone"
                type="tel"
                placeholder="+41 79 123 45 67"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rate">Stundenansatz (CHF/h) *</Label>
              <Input
                id="edit-rate"
                type="number"
                step="0.50"
                placeholder="45.00"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={updateEmployee.isPending}>
              {updateEmployee.isPending ? (
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
            <AlertDialogTitle>Mitarbeiter löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie <strong>{selectedEmployee?.first_name} {selectedEmployee?.last_name}</strong> wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={resetForm}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteEmployee.isPending}
            >
              {deleteEmployee.isPending ? (
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

      {/* Global Settings */}
    </div>
    </DemoFieldset>
  );
};

export default Mitarbeitende;
