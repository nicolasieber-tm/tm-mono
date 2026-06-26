import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Loader2, ChevronDown, ChevronRight, Building2, Clock, User, Calendar, ArrowRight } from "lucide-react";
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from "@/hooks/useClients";
import { useKunden } from "@/hooks/useKunden";
import { useIsSingleLevel } from "@/hooks/useClientHierarchyMode";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { Database } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import {
  SALUTATION_NONE_VALUE,
  normalizeSalutationInput,
} from "@/utils/salutation";

type Client = Database["public"]["Tables"]["clients"]["Row"];
type TimeEntry = Database["public"]["Tables"]["time_entries"]["Row"] & {
  companies?: { name: string } | null;
  clients?: { first_name: string; last_name: string } | null;
  employees?: { first_name: string; last_name: string } | null;
};

const buildContactPersonName = (firstName: string, lastName: string) =>
  [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");

const splitContactPersonName = (fullName: string | null) => {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstName: parts[0] || "", lastName: "" };
  }
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
};

const SalutationSelect = ({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <Select value={value || SALUTATION_NONE_VALUE} onValueChange={onChange}>
    <SelectTrigger id={id}>
      <SelectValue placeholder="Anrede wählen" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value={SALUTATION_NONE_VALUE}>Keine Anrede</SelectItem>
      <SelectItem value="Herr">Herr</SelectItem>
      <SelectItem value="Frau">Frau</SelectItem>
      <SelectItem value="Divers">Divers</SelectItem>
    </SelectContent>
  </Select>
);

const Klienten = () => {
  const isSingle = useIsSingleLevel();
  const navigate = useNavigate();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [formData, setFormData] = useState({
    company_id: "",
    first_name: "",
    last_name: "",
    salutation: SALUTATION_NONE_VALUE,
    contact_person: "",
    contact_person_first_name: "",
    contact_person_last_name: "",
    contact_person_salutation: SALUTATION_NONE_VALUE,
    notes: "",
    address: "",
    zip: "",
    city: "",
    birthdate: "",
  });

  const { data: clients, isLoading } = useClients();
  const { data: companies } = useKunden();
  const { data: timeEntries } = useTimeEntries();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  // Filter time entries by selected month
  const filteredTimeEntries = useMemo(() => {
    if (!timeEntries || !selectedMonth) return [];
    const [year, month] = selectedMonth.split('-').map(Number);
    return timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === year && entryDate.getMonth() + 1 === month;
    });
  }, [timeEntries, selectedMonth]);

  // Generate month options (last 12 months)
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('de-DE', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    return options;
  }, []);

  useEffect(() => {
    if (isSingle) {
      navigate("/unternehmen", { replace: true });
    }
  }, [isSingle, navigate]);

  if (isSingle) {
    return null;
  }

  const resetForm = () => {
    setFormData({
      company_id: "",
      first_name: "",
      last_name: "",
      salutation: SALUTATION_NONE_VALUE,
      contact_person: "",
      contact_person_first_name: "",
      contact_person_last_name: "",
      contact_person_salutation: SALUTATION_NONE_VALUE,
      notes: "",
      address: "",
      zip: "",
      city: "",
      birthdate: "",
    });
    setSelectedClient(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const contactPerson = buildContactPersonName(
      formData.contact_person_first_name,
      formData.contact_person_last_name,
    );
    await createClient.mutateAsync({
      company_id: formData.company_id,
      first_name: formData.first_name,
      last_name: formData.last_name,
      salutation: normalizeSalutationInput(formData.salutation),
      contact_person: contactPerson || null,
      contact_person_first_name: formData.contact_person_first_name || null,
      contact_person_last_name: formData.contact_person_last_name || null,
      contact_person_salutation: normalizeSalutationInput(formData.contact_person_salutation),
      notes: formData.notes || null,
      address: formData.address || null,
      zip: formData.zip || null,
      city: formData.city || null,
      birthdate: formData.birthdate || null,
    });
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEdit = (client: Client) => {
    const legacyContactPerson = splitContactPersonName(client.contact_person);
    setSelectedClient(client);
    setFormData({
      company_id: client.company_id,
      first_name: client.first_name,
      last_name: client.last_name,
      salutation: client.salutation || SALUTATION_NONE_VALUE,
      contact_person: client.contact_person || "",
      contact_person_first_name: client.contact_person_first_name || legacyContactPerson.firstName,
      contact_person_last_name: client.contact_person_last_name || legacyContactPerson.lastName,
      contact_person_salutation: client.contact_person_salutation || SALUTATION_NONE_VALUE,
      notes: client.notes || "",
      address: client.address || "",
      zip: client.zip || "",
      city: client.city || "",
      birthdate: client.birthdate || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    const contactPerson = buildContactPersonName(
      formData.contact_person_first_name,
      formData.contact_person_last_name,
    );
    await updateClient.mutateAsync({
      id: selectedClient.id,
      updates: {
        company_id: formData.company_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        salutation: normalizeSalutationInput(formData.salutation),
        contact_person: contactPerson || null,
        contact_person_first_name: formData.contact_person_first_name || null,
        contact_person_last_name: formData.contact_person_last_name || null,
        contact_person_salutation: normalizeSalutationInput(formData.contact_person_salutation),
        notes: formData.notes || null,
        address: formData.address || null,
        zip: formData.zip || null,
        city: formData.city || null,
        birthdate: formData.birthdate || null,
      },
    });
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (!selectedClient) return;
    await deleteClient.mutateAsync(selectedClient.id);
    setIsDeleteDialogOpen(false);
    resetForm();
  };

  const openDeleteDialog = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const toggleCompany = (companyId: string) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedCompanies(newExpanded);
  };

  const toggleClient = (clientId: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedClients(newExpanded);
  };

  // Get time entries for a specific client
  const getClientTimeEntries = (clientId: string) => {
    return filteredTimeEntries.filter(entry => entry.client_id === clientId);
  };

  // Calculate total hours for a client
  const getClientTotalHours = (clientId: string) => {
    const entries = getClientTimeEntries(clientId);
    return entries.reduce((sum, entry) => sum + (entry.total_hours || 0), 0);
  };

  // Group clients by company
  const clientsByCompany = clients?.reduce((acc, client) => {
    const companyId = client.company_id;
    if (!acc[companyId]) {
      acc[companyId] = [];
    }
    acc[companyId].push(client);
    return acc;
  }, {} as Record<string, typeof clients>);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format hours
  const formatHours = (hours: number) => {
    return `${hours.toFixed(2)}h`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Klienten</h1>
          <p className="text-muted-foreground mt-1">Verwaltung Ihrer Klienten mit Zeiteinträgen nach Unternehmen gruppiert</p>
        </div>
        <div className="flex gap-3 items-center">
          {/* Month Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
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

          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Neuer Klient
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Klienten hinzufügen</DialogTitle>
              <DialogDescription>
                Erfassen Sie die Stammdaten des neuen Klienten
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="company">Firma *</Label>
                <Select value={formData.company_id} onValueChange={(value) => setFormData({ ...formData, company_id: value })} required>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">Vorname *</Label>
                  <Input
                    id="first-name"
                    placeholder="Hans"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Nachname *</Label>
                  <Input
                    id="last-name"
                    placeholder="Müller"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salutation">Anrede Klient</Label>
                <SalutationSelect
                  id="salutation"
                  value={formData.salutation}
                  onChange={(value) => setFormData({ ...formData, salutation: value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-person">Ansprechperson</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="contact-person"
                    placeholder="Vorname"
                    value={formData.contact_person_first_name}
                    onChange={(e) => setFormData({ ...formData, contact_person_first_name: e.target.value })}
                  />
                  <Input
                    id="contact-person-last-name"
                    placeholder="Nachname"
                    value={formData.contact_person_last_name}
                    onChange={(e) => setFormData({ ...formData, contact_person_last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  placeholder="Musterstrasse 123"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip">PLZ</Label>
                  <Input
                    id="zip"
                    placeholder="8000"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ort</Label>
                  <Input
                    id="city"
                    placeholder="Zürich"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthdate">Geburtstag</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Interne Notiz</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder="Besonderheiten, Hinweise..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createClient.isPending}>
                {createClient.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird erstellt...
                  </>
                ) : (
                  "Klient erstellen"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : clientsByCompany && Object.keys(clientsByCompany).length > 0 ? (
        <div className="space-y-4">
          {companies?.map((company) => {
            const companyClients = clientsByCompany[company.id] || [];
            if (companyClients.length === 0) return null;

            const isExpanded = expandedCompanies.has(company.id);

            return (
              <Card key={company.id}>
                <Collapsible
                  open={isExpanded}
                  onOpenChange={() => toggleCompany(company.id)}
                >
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                          <Building2 className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{company.name}</CardTitle>
                          <Badge variant="secondary">{companyClients.length} Klienten</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {company.city ? `${company.zip} ${company.city}` : '-'}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {companyClients.map((client) => {
                          const clientTimeEntries = getClientTimeEntries(client.id);
                          const totalHours = getClientTotalHours(client.id);
                          const isClientExpanded = expandedClients.has(client.id);

                          return (
                            <div key={client.id} className="border rounded-lg overflow-hidden">
                              <Collapsible
                                open={isClientExpanded}
                                onOpenChange={() => toggleClient(client.id)}
                              >
                                <div className="flex items-center justify-between p-4 bg-card hover:bg-muted/50 transition-colors">
                                  <CollapsibleTrigger className="flex items-center gap-3 flex-1">
                                    {isClientExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <User className="h-4 w-4 text-primary" />
                                    <div className="flex-1 text-left">
                                      <div className="font-medium">
                                        {client.first_name} {client.last_name}
                                      </div>
                                      {client.notes && (
                                        <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                          {client.notes}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatHours(totalHours)}
                                      </Badge>
                                      <Badge variant="secondary">
                                        {clientTimeEntries.length} Einträge
                                      </Badge>
                                    </div>
                                  </CollapsibleTrigger>
                                  <div className="flex gap-2 ml-4">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="Details öffnen"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/klienten/${client.id}`);
                                      }}
                                    >
                                      <ArrowRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(client);
                                      }}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openDeleteDialog(client);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                </div>

                                <CollapsibleContent>
                                  <div className="p-4 bg-muted/30 border-t">
                                    {clientTimeEntries.length > 0 ? (
                                      <div className="space-y-2">
                                        <div className="text-sm font-medium text-muted-foreground mb-3">
                                          Zeiteinträge für {monthOptions.find(m => m.value === selectedMonth)?.label}
                                        </div>
                                        {clientTimeEntries.map((entry) => (
                                          <div
                                            key={entry.id}
                                            className="p-3 bg-card rounded-md border text-sm"
                                          >
                                            <div className="flex items-start justify-between">
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                                  <span className="font-medium">{formatDate(entry.date)}</span>
                                                  <Badge variant="outline" className="text-xs">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {formatHours(entry.total_hours || 0)}
                                                  </Badge>
                                                </div>
                                                {(entry.category || entry.activity_description) && (
                                                  <div className="flex items-center gap-2 ml-5 mb-1">
                                                    {entry.category && (
                                                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                                                        {entry.category}
                                                      </span>
                                                    )}
                                                    {entry.activity_description && (
                                                      <span className="text-muted-foreground text-sm">
                                                        {entry.activity_description}
                                                      </span>
                                                    )}
                                                  </div>
                                                )}
                                                {entry.employees && (
                                                  <div className="text-xs text-muted-foreground ml-5 mt-1 flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {entry.employees.first_name} {entry.employees.last_name}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                        <div className="pt-2 mt-2 border-t flex justify-between items-center">
                                          <span className="text-sm font-medium">Gesamt</span>
                                          <Badge variant="default" className="font-bold">
                                            {formatHours(totalHours)}
                                          </Badge>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-center py-6 text-sm text-muted-foreground">
                                        Keine Zeiteinträge für diesen Monat
                                      </div>
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            Keine Klienten vorhanden. Erstellen Sie Ihren ersten Klienten.
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Klient bearbeiten</DialogTitle>
            <DialogDescription>
              Stammdaten und Sitzungsnotizen des Klienten
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2">
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-company">Firma *</Label>
                  <Select value={formData.company_id} onValueChange={(value) => setFormData({ ...formData, company_id: value })} required>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-first-name">Vorname *</Label>
                    <Input
                      id="edit-first-name"
                      placeholder="Hans"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-last-name">Nachname *</Label>
                    <Input
                      id="edit-last-name"
                      placeholder="Müller"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-salutation">Anrede Klient</Label>
                  <SalutationSelect
                    id="edit-salutation"
                    value={formData.salutation}
                    onChange={(value) => setFormData({ ...formData, salutation: value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-contact-person">Ansprechperson</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      id="edit-contact-person"
                      placeholder="Vorname"
                      value={formData.contact_person_first_name}
                      onChange={(e) => setFormData({ ...formData, contact_person_first_name: e.target.value })}
                    />
                    <Input
                      id="edit-contact-person-last-name"
                      placeholder="Nachname"
                      value={formData.contact_person_last_name}
                      onChange={(e) => setFormData({ ...formData, contact_person_last_name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Adresse</Label>
                  <Input
                    id="edit-address"
                    placeholder="Musterstrasse 123"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-zip">PLZ</Label>
                    <Input
                      id="edit-zip"
                      placeholder="8000"
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-city">Ort</Label>
                    <Input
                      id="edit-city"
                      placeholder="Zürich"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-birthdate">Geburtstag</Label>
                  <Input
                    id="edit-birthdate"
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Allgemeine Notiz (Stammdaten)</Label>
                  <Textarea
                    id="edit-notes"
                    rows={3}
                    placeholder="Dauerhafte Besonderheiten, Hinweise … (NICHT für Sitzungsnotizen)"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={updateClient.isPending}>
                  {updateClient.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird aktualisiert...
                    </>
                  ) : (
                    "Änderungen speichern"
                  )}
                </Button>
              </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Klient löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie <strong>{selectedClient?.first_name} {selectedClient?.last_name}</strong> wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={resetForm}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteClient.isPending}
            >
              {deleteClient.isPending ? (
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

export default Klienten;
