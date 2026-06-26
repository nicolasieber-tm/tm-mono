import { useState, useEffect, useRef } from "react";
import { DemoFieldset, DemoReadOnlyNotice } from "@/components/demo/DemoChrome";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Building2, Save, X, Activity, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUnternehmen, useSaveUnternehmen, useUpdateUnternehmen } from "@/hooks/useUnternehmen";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useUnresolvedCriticalCount } from "@/hooks/useSystemErrors";
import { ExpenseCategoryManager } from "@/components/ExpenseCategoryManager";
import NotesVisibilitySettings from "@/components/settings/NotesVisibilitySettings";
import HierarchyModeSettings from "@/components/settings/HierarchyModeSettings";
import ExpenseClientLinkingSettings from "@/components/settings/ExpenseClientLinkingSettings";
import BananaExportSettings from "@/components/settings/BananaExportSettings";
import BananaMappingEditor from "@/components/settings/BananaMappingEditor";
import ExpenseLineItemsSettings from "@/components/settings/ExpenseLineItemsSettings";
import { useUnternehmenBananaSettings } from "@/hooks/useUnternehmenBananaSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";
import {
  useExpenseViewPreference,
  useUpdateExpenseViewPreference,
} from "@/hooks/useExpenseViewPreference";

const DEFAULT_INVOICE_TEMPLATE_STORAGE_KEY_PREFIX =
  "oneclick-office-default-invoice-template-id:";

const emptyFormData = {
  company_name: "",
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
};

const Einstellungen = () => {
  const { data: companySettings = [], isLoading } = useUnternehmen();
  const { activeCompanyId } = useActiveCompany();
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();
  const { data: criticalCount = 0 } = useUnresolvedCriticalCount();
  const { data: bananaSettings } = useUnternehmenBananaSettings();
  const saveSettings = useSaveUnternehmen();
  const updateSettings = useUpdateUnternehmen();
  const hasUserOpenedTemplateSelectRef = useRef(false);

  const [formData, setFormData] = useState(emptyFormData);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [invoiceTemplates, setInvoiceTemplates] = useState<Array<{ id: string; name: string }>>([]);
  const [invoiceTemplatesLoading, setInvoiceTemplatesLoading] = useState(false);
  const [defaultInvoiceTemplateId, setDefaultInvoiceTemplateId] = useState<string>("");
  const [initialDefaultInvoiceTemplateId, setInitialDefaultInvoiceTemplateId] = useState<string>("");

  const persistDefaultInvoiceTemplate = (templateId: string, companyId?: string | null) => {
    const targetCompanyId = companyId ?? activeCompanyId;
    if (!targetCompanyId) return;

    const perCompanyKey = `${DEFAULT_INVOICE_TEMPLATE_STORAGE_KEY_PREFIX}${targetCompanyId}`;
    localStorage.setItem(perCompanyKey, templateId);
    localStorage.setItem("default_invoice_template", templateId);
  };

  // Load user's company into form (automatically use the first/only company)
  useEffect(() => {
    const currentCompany = activeCompanyId
      ? companySettings.find((company) => company.id === activeCompanyId)
      : companySettings.length > 0
        ? companySettings[0]
        : undefined;

    if (currentCompany) {
      setFormData({
        company_name: currentCompany.company_name || "",
        address: currentCompany.address || "",
        building_number: currentCompany.building_number || "",
        zip: currentCompany.zip || "",
        city: currentCompany.city || "",
        country: currentCompany.country || "CH",
        phone: currentCompany.phone || "",
        email: currentCompany.email || "",
        website: currentCompany.website || "",
        iban: currentCompany.iban || "",
        vat_number: currentCompany.vat_number || "",
        logo_url: currentCompany.logo_url || "",
      });

      const storedTemplateId =
        currentCompany.default_invoice_template_id ||
        (() => {
          const perCompanyKey = `${DEFAULT_INVOICE_TEMPLATE_STORAGE_KEY_PREFIX}${currentCompany.id}`;
          return (
            localStorage.getItem(perCompanyKey) || localStorage.getItem("default_invoice_template") || ""
          );
        })();

      const resolvedTemplateId = storedTemplateId || "";
      setDefaultInvoiceTemplateId(resolvedTemplateId);
      setInitialDefaultInvoiceTemplateId(resolvedTemplateId);
      hasUserOpenedTemplateSelectRef.current = false;
    } else {
      setFormData(emptyFormData);
      setDefaultInvoiceTemplateId("");
      setInitialDefaultInvoiceTemplateId("");
      hasUserOpenedTemplateSelectRef.current = false;
    }
  }, [companySettings, activeCompanyId]);

  // Fetch invoice templates for user's ERP company
  useEffect(() => {
    const fetchInvoiceTemplates = async () => {
      if (!activeCompanyId) {
        setInvoiceTemplates([]);
        return;
      }

      setInvoiceTemplatesLoading(true);
      try {
        const { data, error } = await supabase
          .from("invoice_templates")
          .select("id,name")
          .eq("unternehmen_id", activeCompanyId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setInvoiceTemplates(data || []);
      } catch {
        setInvoiceTemplates([]);
      } finally {
        setInvoiceTemplatesLoading(false);
      }
    };

    fetchInvoiceTemplates();
  }, [activeCompanyId]);

  // Keep default template in sync once templates are loaded
  useEffect(() => {
    if (!activeCompanyId || invoiceTemplatesLoading) return;

    const currentCompany = companySettings.find((company) => company.id === activeCompanyId);
    const perCompanyKey = `${DEFAULT_INVOICE_TEMPLATE_STORAGE_KEY_PREFIX}${activeCompanyId}`;

    const savedTemplateId =
      currentCompany?.default_invoice_template_id ||
      localStorage.getItem(perCompanyKey) ||
      localStorage.getItem("default_invoice_template") ||
      "";

    const hasSavedTemplate = !!savedTemplateId && invoiceTemplates.some((t) => t.id === savedTemplateId);

    if (hasSavedTemplate && defaultInvoiceTemplateId !== savedTemplateId) {
      setDefaultInvoiceTemplateId(savedTemplateId);
      setInitialDefaultInvoiceTemplateId(savedTemplateId);
      persistDefaultInvoiceTemplate(savedTemplateId);
      return;
    }

    if (!hasSavedTemplate) {
      const fallbackId = invoiceTemplates.length === 1 ? invoiceTemplates[0].id : "";
      if (defaultInvoiceTemplateId !== fallbackId) {
        setDefaultInvoiceTemplateId(fallbackId);
        setInitialDefaultInvoiceTemplateId(fallbackId);
        persistDefaultInvoiceTemplate(fallbackId);
      }
    }
  }, [
    invoiceTemplates,
    invoiceTemplatesLoading,
    companySettings,
    activeCompanyId,
    defaultInvoiceTemplateId,
  ]);

  const handleDefaultInvoiceTemplateChange = (value: string) => {
    const nextTemplateId = value === "none" ? "" : value;
    setDefaultInvoiceTemplateId((prev) => {
      const hasChanged = nextTemplateId !== prev;
      const differsFromInitial = nextTemplateId !== initialDefaultInvoiceTemplateId;
      if (hasChanged && differsFromInitial && hasUserOpenedTemplateSelectRef.current) {
        toast.success("Standard Rechnungsvorlage aktualisiert – Speichern nicht vergessen");
      }
      return nextTemplateId;
    });
    persistDefaultInvoiceTemplate(nextTemplateId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalLogoUrl = formData.logo_url;

    if (logoFile) {
      setIsUploading(true);
      try {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `company-logo-${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('company-assets')
          .upload(fileName, logoFile, {
            upsert: true
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('company-assets')
          .getPublicUrl(fileName);

        finalLogoUrl = publicUrl;
      } catch {
        toast.error("Fehler beim Hochladen des Logos");
        setIsUploading(false);
        return; 
      } finally {
        setIsUploading(false);
      }
    }

    const normalizedDefaultTemplateId = defaultInvoiceTemplateId || "";
    const submissionData = {
      ...formData,
      logo_url: finalLogoUrl,
      default_invoice_template_id: normalizedDefaultTemplateId || null,
    };

    // Get the current company (first one from the list)
    const currentCompany = activeCompanyId
      ? companySettings.find((company) => company.id === activeCompanyId) || null
      : companySettings.length > 0
        ? companySettings[0]
        : null;
    let savedCompanyId = currentCompany?.id || null;

    // Update existing company or create a new one
    if (currentCompany?.id) {
      const updated = await updateSettings.mutateAsync({
        id: currentCompany.id,
        updates: submissionData,
      });
      savedCompanyId = updated?.id ?? currentCompany.id;
    } else {
      const created = await saveSettings.mutateAsync(submissionData);
      savedCompanyId = created?.id ?? savedCompanyId;
    }

    // Reflect uploaded logo immediately in UI
    setFormData((prev) => ({ ...prev, logo_url: finalLogoUrl }));
    persistDefaultInvoiceTemplate(normalizedDefaultTemplateId, savedCompanyId);

    // Reset file input
    setLogoFile(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DemoFieldset>
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <DemoReadOnlyNotice title="Firmeneinstellungen" />
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Firmeneinstellungen</h1>
          <p className="text-muted-foreground mt-1">
            Diese Daten erscheinen auf allen Rechnungen als Absender
          </p>
        </div>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>Ihre Firmendaten</CardTitle>
          <CardDescription>
            Geben Sie hier Ihre Unternehmensdaten ein, die auf den Rechnungen erscheinen sollen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Stammdaten */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Stammdaten</h3>

              <div className="space-y-2">
                <Label htmlFor="company_name">Firmenname *</Label>
                <Input
                  id="company_name"
                  placeholder="z.B. Blickwinkel GmbH"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  required
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
                  <Label htmlFor="building_number">Hausnummer</Label>
                  <Input
                    id="building_number"
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

            {/* Kontaktdaten */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Kontaktdaten</h3>

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

            {/* Rechnungsinformationen */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Rechnungsinformationen</h3>

              <div className="space-y-2">
                <Label htmlFor="iban">IBAN *</Label>
                <Input
                  id="iban"
                  placeholder="CH93 0076 2011 6238 5295 7"
                  value={formData.iban}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Diese IBAN wird für die QR-Rechnung und Zahlungsinformationen verwendet
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vat_number">MwSt-Nummer</Label>
                <Input
                  id="vat_number"
                  placeholder="CHE-123.456.789 MWST"
                  value={formData.vat_number}
                  onChange={(e) => setFormData({ ...formData, vat_number: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-invoice-template">Standard Rechnungsvorlage</Label>
                  <Select
                    value={defaultInvoiceTemplateId ? defaultInvoiceTemplateId : "none"}
                    onValueChange={handleDefaultInvoiceTemplateChange}
                    disabled={!activeCompanyId || invoiceTemplatesLoading}
                    onOpenChange={(open) => {
                      if (open) {
                        hasUserOpenedTemplateSelectRef.current = true;
                      }
                    }}
                  >
                  <SelectTrigger id="default-invoice-template" className="w-full">
                    <SelectValue
                      placeholder={
                        !activeCompanyId
                          ? "Zuerst ERP-Unternehmen auswählen"
                          : invoiceTemplatesLoading
                            ? "Lade Vorlagen..."
                            : "Vorlage wählen (optional)"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keine Standardvorlage</SelectItem>
                    {invoiceTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Diese Vorlage wird für die Sammel-Rechnungsgenerierung verwendet.
                </p>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Branding</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="logo_upload">Firmenlogo hochladen</Label>
                    <div className="flex items-center gap-3">
                      <input
                        ref={logoInputRef}
                        id="logo_upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setLogoFile(file);
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        Datei wählen
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {logoFile?.name
                          ? logoFile.name
                          : formData.logo_url
                            ? "Logo hochgeladen"
                            : "Keine Datei ausgewählt"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Laden Sie Ihr Firmenlogo hoch (JPG, PNG, SVG). Es wird auf den Rechnungen oben rechts angezeigt.
                    </p>
                  </div>
                  
                  {/* Logo Preview */}
                  <div className="w-24 h-24 border rounded-lg overflow-hidden flex items-center justify-center bg-muted/10 relative group">
                    {(logoFile ? URL.createObjectURL(logoFile) : formData.logo_url) ? (
                      <>
                        <img 
                          src={logoFile ? URL.createObjectURL(logoFile) : formData.logo_url} 
                          alt="Logo Preview" 
                          className="w-full h-full object-contain p-1"
                        />
                        {!logoFile && formData.logo_url && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, logo_url: "" })}
                            className="absolute top-1 right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Logo entfernen"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground text-center p-2">Kein Logo</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Expense Categories */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Spesen-Kategorien</h3>
              <div className="space-y-2">
                <Label>Kategorien verwalten</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Definieren Sie hier die Kategorien, die bei der Spesenerfassung zur Auswahl stehen.
                </p>
                <ExpenseCategoryManager />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="submit"
                disabled={saveSettings.isPending || isUploading}
                className="min-w-[150px]"
              >
                {saveSettings.isPending || isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird gespeichert...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Speichern
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <NotesVisibilitySettings />

      <HierarchyModeSettings />

      <ExpenseClientLinkingSettings />

      <BananaExportSettings />

      {bananaSettings?.banana_export_enabled && <BananaMappingEditor />}

      <ExpenseLineItemsSettings />

      <Card>
        <CardHeader>
          <CardTitle>Spesen · Beleg-Darstellung</CardTitle>
          <CardDescription>
            Wähle, wie Belege innerhalb einer Kategorie in der Ordner-Ansicht angezeigt werden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SpesenViewPreferenceRadio />
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              System-Status
            </CardTitle>
            <CardDescription>
              Überwachung der KI-Belegerkennung und protokollierte System-Fehler.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              type="button"
              onClick={() => navigate("/einstellungen/system-status")}
              className="flex items-center justify-between w-full p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-slate-900 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm">System-Status öffnen</span>
                {criticalCount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5">
                    {criticalCount} kritisch
                  </span>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>
          </CardContent>
        </Card>
      )}
    </div>
    </DemoFieldset>
  );
};

function SpesenViewPreferenceRadio() {
  const { data: current = "summary", isLoading } = useExpenseViewPreference();
  const update = useUpdateExpenseViewPreference();

  if (isLoading) {
    return <div className="text-sm text-slate-500">Lade Einstellung…</div>;
  }

  return (
    <RadioGroup
      value={current}
      onValueChange={(v) => update.mutate(v as "summary" | "gallery")}
      className="flex flex-col gap-3"
    >
      <Label
        htmlFor="view-summary"
        className="flex items-start gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer has-[:checked]:border-slate-900 has-[:checked]:bg-slate-50"
      >
        <RadioGroupItem value="summary" id="view-summary" className="mt-1" />
        <div>
          <div className="font-bold text-sm">Zusammenfassung</div>
          <div className="text-xs text-slate-500 mt-0.5">
            Karte mit Beleg-Thumbnail, Name, Datum, Betrag. Strukturiert und informationsdicht.
          </div>
        </div>
      </Label>
      <Label
        htmlFor="view-gallery"
        className="flex items-start gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer has-[:checked]:border-slate-900 has-[:checked]:bg-slate-50"
      >
        <RadioGroupItem value="gallery" id="view-gallery" className="mt-1" />
        <div>
          <div className="font-bold text-sm">Echte Fotos</div>
          <div className="text-xs text-slate-500 mt-0.5">
            Nur das Beleg-Bild als Galerie, mit dezentem Preis-Overlay. Fotografisch, minimaler Chrome.
          </div>
        </div>
      </Label>
    </RadioGroup>
  );
}

export default Einstellungen;
