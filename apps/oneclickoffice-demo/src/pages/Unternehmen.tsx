import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useKunden, useCreateKunde, useUpdateKunde, useDeleteKunde } from "@/hooks/useKunden";
import { Database } from "@/integrations/supabase/types";
import { useIsSingleLevel } from "@/hooks/useClientHierarchyMode";
import { useNavigate } from "react-router-dom";
import {
  SALUTATION_NONE_VALUE,
  normalizeSalutationInput,
} from "@/utils/salutation";

type Company = Database["public"]["Tables"]["kunden"]["Row"] & {
  clients?: { count: number }[];
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

const Unternehmen = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    salutation: SALUTATION_NONE_VALUE,
    contact_person: "",
    contact_person_first_name: "",
    contact_person_last_name: "",
    contact_person_salutation: SALUTATION_NONE_VALUE,
    address: "",
    building_number: "",
    zip: "",
    city: "",
    country: "CH",
    phone: "",
    email: "",
    website: "",
    iban: "",
    vat_number: "",
    logo_url: "",
    customer_type: "business",
    birthdate: null as string | null,
    notes: null as string | null,
  });

  const isSingle = useIsSingleLevel();
  const navigate = useNavigate();

  const { data: companies, isLoading } = useKunden();
  const createCompany = useCreateKunde();
  const updateCompany = useUpdateKunde();
  const deleteCompany = useDeleteKunde();

  const resetForm = () => {
    setFormData({
      name: "",
      salutation: SALUTATION_NONE_VALUE,
      contact_person: "",
      contact_person_first_name: "",
      contact_person_last_name: "",
      contact_person_salutation: SALUTATION_NONE_VALUE,
      address: "",
      building_number: "",
      zip: "",
      city: "",
      country: "CH",
      phone: "",
      email: "",
      website: "",
      iban: "",
      vat_number: "",
      logo_url: "",
      customer_type: "business",
      birthdate: null,
      notes: null,
    });
    setSelectedCompany(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const contactPerson = buildContactPersonName(
      formData.contact_person_first_name,
      formData.contact_person_last_name,
    );
    await createCompany.mutateAsync({
      ...formData,
      salutation: normalizeSalutationInput(formData.salutation),
      contact_person: contactPerson || null,
      contact_person_first_name: formData.contact_person_first_name || null,
      contact_person_last_name: formData.contact_person_last_name || null,
      contact_person_salutation: normalizeSalutationInput(formData.contact_person_salutation),
    });
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEdit = (company: Company) => {
    const legacyContactPerson = splitContactPersonName(company.contact_person);
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      salutation: company.salutation || SALUTATION_NONE_VALUE,
      contact_person: company.contact_person || "",
      contact_person_first_name: company.contact_person_first_name || legacyContactPerson.firstName,
      contact_person_last_name: company.contact_person_last_name || legacyContactPerson.lastName,
      contact_person_salutation: company.contact_person_salutation || SALUTATION_NONE_VALUE,
      address: company.address || "",
      building_number: company.building_number || "",
      zip: company.zip || "",
      city: company.city || "",
      country: company.country || "CH",
      phone: company.phone || "",
      email: company.email || "",
      website: company.website || "",
      iban: company.iban || "",
      vat_number: company.vat_number || "",
      logo_url: company.logo_url || "",
      customer_type: company.customer_type || "business",
      birthdate: company.birthdate ?? null,
      notes: company.notes ?? null,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    const contactPerson = buildContactPersonName(
      formData.contact_person_first_name,
      formData.contact_person_last_name,
    );
    await updateCompany.mutateAsync({
      id: selectedCompany.id,
      updates: {
        ...formData,
        salutation: normalizeSalutationInput(formData.salutation),
        contact_person: contactPerson || null,
        contact_person_first_name: formData.contact_person_first_name || null,
        contact_person_last_name: formData.contact_person_last_name || null,
        contact_person_salutation: normalizeSalutationInput(formData.contact_person_salutation),
      },
    });
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (!selectedCompany) return;
    await deleteCompany.mutateAsync(selectedCompany.id);
    setIsDeleteDialogOpen(false);
    resetForm();
  };

  const openDeleteDialog = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{isSingle ? "Kunden" : "Unternehmen"}</h1>
          <p className="text-muted-foreground mt-1">Verwaltung Ihrer Auftraggeber</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {isSingle ? "Neuer Kunde" : "Neue Firma"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{isSingle ? "Neuen Kunden erstellen" : "Neue Firma erstellen"}</DialogTitle>
              <DialogDescription>
                Erfassen Sie die Stammdaten des neuen Auftraggebers
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2 overflow-y-auto flex-1 px-2">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Stammdaten</h3>
                <div className="space-y-2">
                  <Label htmlFor="company-name">{isSingle ? "Name" : "Firmenname"} *</Label>
                  <Input
                    id="company-name"
                    placeholder={isSingle ? "z.B. Max Muster" : "z.B. Blickwinkel GmbH"}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-contact-person">Ansprechperson</Label>
                    <Input
                      id="company-contact-person"
                      placeholder="Vorname"
                      value={formData.contact_person_first_name}
                      onChange={(e) => setFormData({ ...formData, contact_person_first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-contact-person-last-name">Nachname Ansprechperson</Label>
                    <Input
                      id="company-contact-person-last-name"
                      placeholder="Nachname"
                      value={formData.contact_person_last_name}
                      onChange={(e) => setFormData({ ...formData, contact_person_last_name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-contact-person-salutation">Anrede Ansprechperson</Label>
                  <SalutationSelect
                    id="company-contact-person-salutation"
                    value={formData.contact_person_salutation}
                    onChange={(value) => setFormData({ ...formData, contact_person_salutation: value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Strasse</Label>
                    <Input
                      id="address"
                      placeholder="Musterstrasse"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="building-number">Hausnummer</Label>
                    <Input
                      id="building-number"
                      placeholder="123"
                      value={formData.building_number}
                      onChange={(e) => setFormData({ ...formData, building_number: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zip">PLZ</Label>
                    <Input
                      id="zip"
                      placeholder="4500"
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ort</Label>
                    <Input
                      id="city"
                      placeholder="Solothurn"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Land</Label>
                    <Input
                      id="country"
                      placeholder="CH"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm">Kundentyp</h3>
                <div className="space-y-2">
                  <Label htmlFor="customer-type">Kundentyp *</Label>
                  <Select
                    value={formData.customer_type}
                    onValueChange={(value) => setFormData({ ...formData, customer_type: value })}
                  >
                    <SelectTrigger id="customer-type">
                      <SelectValue placeholder="Kundentyp wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Unternehmen (normaler Stundensatz)</SelectItem>
                      <SelectItem value="private">Privatkunde (+20 CHF zum Stundensatz)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Bei Privatkunden werden automatisch 20 CHF zum Stundensatz hinzugefügt
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm">Kontaktdaten</h3>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+41 32 123 45 67"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="info@beispiel.ch"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://www.beispiel.ch"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>

              {isSingle && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-sm">Persönliche Angaben</h3>
                  <div className="space-y-2">
                    <Label htmlFor="birthdate">Geburtsdatum</Label>
                    <Input
                      id="birthdate"
                      type="date"
                      value={formData.birthdate ?? ""}
                      onChange={(e) =>
                        setFormData({ ...formData, birthdate: e.target.value || null })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kunde_notes">Stammdaten-Notiz</Label>
                    <Textarea
                      id="kunde_notes"
                      rows={4}
                      placeholder="Freitext-Notiz zum Kunden"
                      value={formData.notes ?? ""}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value || null })
                      }
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={createCompany.isPending}>
                {createCompany.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird erstellt...
                  </>
                ) : (
                  isSingle ? "Kunden erstellen" : "Firma erstellen"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isSingle ? "Alle Kunden" : "Alle Firmen"}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : companies && companies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isSingle ? "Name" : "Firmenname"}</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>PLZ/Ort</TableHead>
                  {!isSingle && <TableHead className="text-right">Anzahl Klienten</TableHead>}
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">
                      <button
                        type="button"
                        className="text-left text-primary hover:underline"
                        onClick={() => navigate(`/unternehmen/${company.id}`)}
                      >
                        {company.name}
                      </button>
                    </TableCell>
                    <TableCell>
                      {company.address
                        ? `${company.address}${company.building_number ? ' ' + company.building_number : ''}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {company.zip && company.city
                        ? `${company.zip} ${company.city}`
                        : company.city || company.zip || "-"}
                    </TableCell>
                    {!isSingle && (
                      <TableCell className="text-right">
                        {company.clients?.[0]?.count || 0}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(company)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(company)}
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
              Keine Unternehmen vorhanden. Erstellen Sie Ihr erstes Unternehmen.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{isSingle ? "Kunden bearbeiten" : "Firma bearbeiten"}</DialogTitle>
            <DialogDescription>
              Aktualisieren Sie die Stammdaten des Auftraggebers
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-2 overflow-y-auto flex-1 px-2">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Stammdaten</h3>
              <div className="space-y-2">
                <Label htmlFor="edit-company-name">{isSingle ? "Name" : "Firmenname"} *</Label>
                <Input
                  id="edit-company-name"
                  placeholder={isSingle ? "z.B. Max Muster" : "z.B. Blickwinkel GmbH"}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-company-contact-person">Ansprechperson</Label>
                  <Input
                    id="edit-company-contact-person"
                    placeholder="Vorname"
                    value={formData.contact_person_first_name}
                    onChange={(e) => setFormData({ ...formData, contact_person_first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-company-contact-person-last-name">Nachname Ansprechperson</Label>
                  <Input
                    id="edit-company-contact-person-last-name"
                    placeholder="Nachname"
                    value={formData.contact_person_last_name}
                    onChange={(e) => setFormData({ ...formData, contact_person_last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company-contact-person-salutation">Anrede Ansprechperson</Label>
                <SalutationSelect
                  id="edit-company-contact-person-salutation"
                  value={formData.contact_person_salutation}
                  onChange={(value) => setFormData({ ...formData, contact_person_salutation: value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-address">Strasse</Label>
                  <Input
                    id="edit-address"
                    placeholder="Musterstrasse"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-building-number">Hausnummer</Label>
                  <Input
                    id="edit-building-number"
                    placeholder="123"
                    value={formData.building_number}
                    onChange={(e) => setFormData({ ...formData, building_number: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-zip">PLZ</Label>
                  <Input
                    id="edit-zip"
                    placeholder="4500"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-city">Ort</Label>
                  <Input
                    id="edit-city"
                    placeholder="Solothurn"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-country">Land</Label>
                  <Input
                    id="edit-country"
                    placeholder="CH"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-sm">Kundentyp</h3>
              <div className="space-y-2">
                <Label htmlFor="edit-customer-type">Kundentyp *</Label>
                <Select
                  value={formData.customer_type}
                  onValueChange={(value) => setFormData({ ...formData, customer_type: value })}
                >
                  <SelectTrigger id="edit-customer-type">
                    <SelectValue placeholder="Kundentyp wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Unternehmen (normaler Stundensatz)</SelectItem>
                    <SelectItem value="private">Privatkunde (+20 CHF zum Stundensatz)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Bei Privatkunden werden automatisch 20 CHF zum Stundensatz hinzugefügt
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-sm">Kontaktdaten</h3>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefon</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  placeholder="+41 32 123 45 67"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">E-Mail</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="info@beispiel.ch"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-website">Website</Label>
                <Input
                  id="edit-website"
                  type="url"
                  placeholder="https://www.beispiel.ch"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>

            {isSingle && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm">Persönliche Angaben</h3>
                <div className="space-y-2">
                  <Label htmlFor="edit-birthdate">Geburtsdatum</Label>
                  <Input
                    id="edit-birthdate"
                    type="date"
                    value={formData.birthdate ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, birthdate: e.target.value || null })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-kunde_notes">Stammdaten-Notiz</Label>
                  <Textarea
                    id="edit-kunde_notes"
                    rows={4}
                    placeholder="Freitext-Notiz zum Kunden"
                    value={formData.notes ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value || null })
                    }
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={updateCompany.isPending}>
              {updateCompany.isPending ? (
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Firma löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie <strong>{selectedCompany?.name}</strong> wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={resetForm}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCompany.isPending}
            >
              {deleteCompany.isPending ? (
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

export default Unternehmen;
