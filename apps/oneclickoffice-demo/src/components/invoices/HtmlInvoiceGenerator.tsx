// Note: This component has no selectable-placeholder UI (no chips, tooltips, or help text
// showing available {{placeholder}} tokens), so no modus-aware filtering of klient-placeholders is needed.
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileDown, Plus, Trash2 } from 'lucide-react';
import { generateSwissQRCode, parseAddress } from '@/lib/swissQRCode';
import { useClients } from '@/hooks/useClients';
import { useKunden } from '@/hooks/useKunden';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { getBase64ImageWithDimensions } from '@/utils/workReportGenerator';
import { Database } from '@/integrations/supabase/types';
import { useIsSingleLevel } from '@/hooks/useClientHierarchyMode';
import { formatFormalSalutation, formatSalutationLetter } from '@/utils/salutation';
import { resolveContactFirstName, resolveContactLastName, resolveContactFullName } from '@/utils/contactPerson';

type TimeEntryRow = Database["public"]["Tables"]["time_entries"]["Row"] & {
  hourly_rate?: number;
};

interface InvoicePosition {
  beschreibung: string;
  menge: number;
  preis: number;
}

interface InvoiceData {
  firma: string;
  datum: string;
  rechnungsnummer: string;
  positionen: InvoicePosition[];
  total: number;
  logoUrl?: string;
  monat?: string;
  jahr?: string;
  faelligkeitsdatum?: string;
  klientGeburtstag?: string;
  geburtstag?: string;
  // Company fields
  firmenname?: string;
  strasse?: string;
  hausnummer?: string;
  plz?: string;
  ort?: string;
  land?: string;
  telefon?: string;
  email?: string;
  website?: string;
  iban?: string;
  mwstnummer?: string;
  // Client address fields (for debtor in QR code)
  clientStrasse?: string;
  clientPlz?: string;
  clientOrt?: string;
  klientAnrede?: string;
  klientAnredeBrief?: string;
  klientHoeflichkeitsanrede?: string;
  ansprechperson?: string;
  ansprechpersonAnrede?: string;
  ansprechpersonAnredeBrief?: string;
  ansprechpersonHoeflichkeitsanrede?: string;
  ansprechpersonVorname?: string;
  ansprechpersonNachname?: string;
  ansprechpersonName?: string;
  klientUnternehmenAnsprechperson?: string;
  klientUnternehmenAnsprechpersonAnrede?: string;
  klientUnternehmenAnsprechpersonAnredeBrief?: string;
  kundeAnrede?: string;
  kundeAnredeBrief?: string;
  kundeHoeflichkeitsanrede?: string;
}

interface HtmlTemplate {
  id: string;
  name: string;
  html_content: string;
  css_content: string;
}

interface HtmlInvoiceGeneratorProps {
  templates: HtmlTemplate[];
}

export default function HtmlInvoiceGenerator({ templates }: HtmlInvoiceGeneratorProps) {
  const { toast } = useToast();
  const { activeCompany } = useActiveCompany();
  const isSingleLevel = useIsSingleLevel();
  const { data: clients } = useClients({ enabled: !isSingleLevel });
  const { data: companies } = useKunden();
  const [selectedTemplate, setSelectedTemplate] = useState<HtmlTemplate | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [timeEntries, setTimeEntries] = useState<TimeEntryRow[]>([]);
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    firma: '',
    datum: new Date().toISOString().split('T')[0],
    rechnungsnummer: '',
    positionen: [{ beschreibung: '', menge: 1, preis: 0 }],
    total: 0,
    logoUrl: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const formatDateToSwiss = (value?: string | Date | null): string => {
    if (!value) return '';

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

    if (!parts) return typeof value === 'string' ? value : '';

    const day = String(parts.day).padStart(2, '0');
    const month = String(parts.month).padStart(2, '0');
    const year = String(parts.year).padStart(4, '0');

    return `${day}.${month}.${year}`;
  };

  // Load company settings into invoice data
  useEffect(() => {
    if (activeCompany) {
      setInvoiceData((prev) => ({
        ...prev,
        firmenname: activeCompany.company_name || prev.firmenname,
        strasse: activeCompany.address || prev.strasse,
        hausnummer: activeCompany.building_number || prev.hausnummer,
        plz: activeCompany.zip || prev.plz,
        ort: activeCompany.city || prev.ort,
        land: activeCompany.country || prev.land || 'CH',
        telefon: activeCompany.phone || prev.telefon,
        email: activeCompany.email || prev.email,
        website: activeCompany.website || prev.website,
        iban: activeCompany.iban || prev.iban,
        mwstnummer: activeCompany.vat_number || prev.mwstnummer,
        logoUrl: activeCompany.logo_url || prev.logoUrl,
      }));
    }
  }, [activeCompany]);

  // Reset client selection when company changes
  useEffect(() => {
    setSelectedClientId('');
  }, [selectedCompanyId]);

  // Derive Monat/Jahr aus der UI-Auswahl (YYYY-MM)
  useEffect(() => {
    if (!selectedMonth) return;

    const [year, month] = selectedMonth.split('-');
    const numericMonth = parseInt(month, 10);
    const monthName = !Number.isNaN(numericMonth)
      ? new Date(parseInt(year, 10), numericMonth - 1, 1).toLocaleString('de-CH', { month: 'long' })
      : '';

    setInvoiceData((prev) => ({
      ...prev,
      monat: monthName,
      jahr: year,
    }));
  }, [selectedMonth]);

  // Filter clients by selected company
  const filteredClients = React.useMemo(() => {
    if (!selectedCompanyId) return [];
    return clients?.filter(client => client.company_id === selectedCompanyId) || [];
  }, [clients, selectedCompanyId]);

  useEffect(() => {
    if (!selectedCompanyId) return;

    const company = companies?.find(c => c.id === selectedCompanyId);
    const client = selectedClientId ? clients?.find(c => c.id === selectedClientId) : null;
    const clientContactFirstName = resolveContactFirstName(client);
    const clientContactLastName = resolveContactLastName(client);
    const clientContactName = resolveContactFullName(client);
    const companyContactFirstName = resolveContactFirstName(company);
    const companyContactLastName = resolveContactLastName(company);
    const companyContactName = resolveContactFullName(company);
    // Priorität: Klient-eigene Ansprechperson > Unternehmen-Ansprechperson > Klient selbst
    const clientHasOwnAnsprechperson = !isSingleLevel && Boolean(clientContactName);
    const hasAnyAnsprechperson = clientHasOwnAnsprechperson || Boolean(companyContactName);
    const contactFirstName = clientHasOwnAnsprechperson ? clientContactFirstName : companyContactFirstName;
    const contactLastName = clientHasOwnAnsprechperson ? clientContactLastName : companyContactLastName;
    const contactName = clientHasOwnAnsprechperson ? clientContactName : companyContactName;
    const contactSalutation = clientHasOwnAnsprechperson
      ? client?.contact_person_salutation
      : company?.contact_person_salutation;
    // Höflichkeitsanrede: Anrede aus AP, sonst Fallback auf Klient-Anrede (kein "Guten Tag")
    const ansprechpersonFallbackSalutation = isSingleLevel
      ? contactSalutation
      : (contactSalutation || client?.salutation);
    const ansprechpersonFallbackLastName = isSingleLevel
      ? contactLastName
      : (hasAnyAnsprechperson ? contactLastName : (contactLastName || client?.last_name || ''));

    setInvoiceData((prev) => ({
      ...prev,
      firma: company?.name || '',
      clientStrasse: isSingleLevel ? company?.address || '' : client?.address || '',
      clientPlz: isSingleLevel ? company?.zip || '' : client?.zip || '',
      clientOrt: isSingleLevel ? company?.city || '' : client?.city || '',
      klientAnrede: client?.salutation || '',
      klientAnredeBrief: formatSalutationLetter(client?.salutation),
      klientHoeflichkeitsanrede: formatFormalSalutation(client?.salutation, client?.last_name),
      ansprechperson: contactName,
      ansprechpersonAnrede: contactSalutation || '',
      ansprechpersonAnredeBrief: formatSalutationLetter(contactSalutation),
      ansprechpersonHoeflichkeitsanrede: formatFormalSalutation(ansprechpersonFallbackSalutation, ansprechpersonFallbackLastName),
      ansprechpersonVorname: contactFirstName,
      ansprechpersonNachname: contactLastName,
      ansprechpersonName: contactName,
      klientUnternehmenAnsprechperson: companyContactName,
      klientUnternehmenAnsprechpersonAnrede: company?.contact_person_salutation || '',
      klientUnternehmenAnsprechpersonAnredeBrief: formatSalutationLetter(company?.contact_person_salutation),
      kundeAnrede: company?.salutation || '',
      kundeAnredeBrief: formatSalutationLetter(company?.salutation),
      kundeHoeflichkeitsanrede: formatFormalSalutation(company?.salutation, company?.name),
    }));
  }, [clients, companies, isSingleLevel, selectedClientId, selectedCompanyId]);

  // Load time entries for selected customer/client and month
  useEffect(() => {
    if (!selectedCompanyId || !selectedMonth || !activeCompany || (!isSingleLevel && !selectedClientId)) {
      setTimeEntries([]);
      return;
    }

    const loadTimeEntries = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Parse month to get start and end dates
      const [year, month] = selectedMonth.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Fetch time entries for this customer/client and month
      let query = supabase
        .from('time_entries')
        .select('*')
        .eq('unternehmen_id', activeCompany.id)
        .eq('company_id', selectedCompanyId)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: true });

      if (!isSingleLevel) {
        query = query.eq('client_id', selectedClientId);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: 'Fehler',
          description: 'Zeiteinträge konnten nicht geladen werden',
          variant: 'destructive',
        });
        return;
      }

      setTimeEntries(data || []);

      // Auto-fill invoice positions from time entries
      if (data && data.length > 0) {
        const regularEntries = data.filter((e: TimeEntryRow) => e.category !== 'Kurzkontakt');
        const kurzkontaktEntries = data.filter((e: TimeEntryRow) => e.category === 'Kurzkontakt');

        const positions: InvoicePosition[] = [];

        // 1. Regular Entries
        regularEntries.forEach((entry: TimeEntryRow) => {
          positions.push({
            beschreibung: entry.activity_description || 'Dienstleistung',
            menge: entry.total_hours || 0,
            preis: entry.hourly_rate || 0,
          });
        });

        // 2. Aggregated Kurzkontakt Entry
        if (kurzkontaktEntries.length > 0) {
          const sumHours = kurzkontaktEntries.reduce((sum: number, e: TimeEntryRow) => sum + (e.total_hours || 0), 0);
          const sumCost = kurzkontaktEntries.reduce((sum: number, e: TimeEntryRow) => sum + ((e.total_hours || 0) * (e.hourly_rate || 0)), 0);
          const avgRate = sumHours > 0 ? sumCost / sumHours : 0;

          positions.push({
            beschreibung: 'Kurzkontakt',
            menge: parseFloat(sumHours.toFixed(2)),
            preis: parseFloat(avgRate.toFixed(2)),
          });
        }

        const company = companies?.find(c => c.id === selectedCompanyId);
        const client = selectedClientId ? clients?.find(c => c.id === selectedClientId) : null;

        setInvoiceData((prev) => ({
          ...prev,
          firma: company?.name || '',
          positionen: positions,
          total: calculateTotal(positions),
          // Add client address information for QR code debtor
          clientStrasse: isSingleLevel ? company?.address || '' : client?.address || '',
          clientPlz: isSingleLevel ? company?.zip || '' : client?.zip || '',
          clientOrt: isSingleLevel ? company?.city || '' : client?.city || '',
        }));
      }
    };

    loadTimeEntries();
  }, [selectedClientId, selectedMonth, clients, companies, selectedCompanyId, activeCompany, isSingleLevel, toast]);

  const calculateTotal = (positions: InvoicePosition[]) => {
    return positions.reduce((sum, pos) => sum + pos.menge * pos.preis, 0);
  };

  const updatePosition = (index: number, field: keyof InvoicePosition, value: string | number) => {
    const newPositions = [...invoiceData.positionen];
    newPositions[index] = { ...newPositions[index], [field]: value };
    setInvoiceData({
      ...invoiceData,
      positionen: newPositions,
      total: calculateTotal(newPositions),
    });
  };

  const addPosition = () => {
    setInvoiceData({
      ...invoiceData,
      positionen: [...invoiceData.positionen, { beschreibung: '', menge: 1, preis: 0 }],
    });
  };

  const removePosition = (index: number) => {
    const newPositions = invoiceData.positionen.filter((_, i) => i !== index);
    setInvoiceData({
      ...invoiceData,
      positionen: newPositions,
      total: calculateTotal(newPositions),
    });
  };

  const generateQRCode = async (): Promise<string> => {
    // Parse address for creditor (own company from settings)
    const creditorAddress = parseAddress(invoiceData.strasse);

    // Parse address for debtor (client/customer)
    const debtorAddress = parseAddress(invoiceData.clientStrasse);

    // Generate Swiss QR Code with proper data structure
    // Creditor = Own company (from unternehmen)
    // Debtor = Customer/Client (from invoice firma field)
    const qrCodeDataUrl = await generateSwissQRCode({
      iban: invoiceData.iban || '',
      creditor: {
        name: invoiceData.firmenname || 'Unbekanntes Unternehmen',
        address: creditorAddress.street || invoiceData.strasse || '',
        buildingNumber: creditorAddress.number || invoiceData.hausnummer,
        zip: invoiceData.plz || '',
        city: invoiceData.ort || '',
        country: invoiceData.land || 'CH',
      },
      amount: invoiceData.total,
      currency: 'CHF',
      debtor: invoiceData.firma
        ? {
          name: invoiceData.firma,
          address: debtorAddress.street || invoiceData.clientStrasse || '',
          buildingNumber: debtorAddress.number,
          zip: invoiceData.clientPlz || '',
          city: invoiceData.clientOrt || '',
          country: 'CH',
        }
        : undefined,
      reference: invoiceData.rechnungsnummer,
      additionalInfo: `Rechnung ${invoiceData.rechnungsnummer}`,
    });

    return qrCodeDataUrl;
  };

  const renderHtmlWithData = async (htmlContent: string, cssContent: string): Promise<string> => {
    let html = htmlContent || '';
    const css = cssContent || '';

    // Extract body content if full HTML document is provided
    if (html.includes('<body>')) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      if (bodyMatch) {
        html = bodyMatch[1];
      }
    }

    // Generate Swiss QR Code
    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await generateQRCode();
    } catch {
      // Continue without QR code if generation fails
    }

    // Replace simple placeholders (with case-insensitive matching for flexibility)
    const formattedDatum = formatDateToSwiss(invoiceData.datum);
    const formattedFaelligkeitsdatum = formatDateToSwiss(invoiceData.faelligkeitsdatum);
    const formattedKlientGeburtstag = formatDateToSwiss(invoiceData.klientGeburtstag || invoiceData.geburtstag);

    html = html.replace(/\{\{firma\}\}/gi, invoiceData.firma || invoiceData.firmenname || '');
    html = html.replace(/\{\{firmenname\}\}/gi, invoiceData.firmenname || invoiceData.firma || '');
    html = html.replace(/\{\{datum\}\}/gi, formattedDatum || '');
    html = html.replace(/\{\{faelligkeitsdatum\}\}/gi, formattedFaelligkeitsdatum || '');
    html = html.replace(/\{\{geburtstag\}\}/gi, formattedKlientGeburtstag || '');
    html = html.replace(/\{\{klientGeburtstag\}\}/gi, formattedKlientGeburtstag || '');
    html = html.replace(/\{\{monat\}\}/gi, invoiceData.monat || '');
    html = html.replace(/\{\{jahr\}\}/gi, invoiceData.jahr || '');
    html = html.replace(/\{\{rechnungsnummer\}\}/gi, invoiceData.rechnungsnummer || '');
    html = html.replace(/\{\{betrag\}\}/gi, invoiceData.total.toFixed(2));
    html = html.replace(/\{\{total\}\}/gi, invoiceData.total.toFixed(2));
    html = html.replace(/\{\{zwischensumme\}\}/gi, invoiceData.total.toFixed(2));
    html = html.replace(/\{\{mwst\}\}/gi, (invoiceData.total * 0.077).toFixed(2)); // 7.7% MwSt
    html = html.replace(/\{\{klientAnrede\}\}/gi, invoiceData.klientAnrede || '');
    html = html.replace(/\{\{klientAnredeBrief\}\}/gi, invoiceData.klientAnredeBrief || '');
    html = html.replace(/\{\{klientHoeflichkeitsanrede\}\}/gi, invoiceData.klientHoeflichkeitsanrede || '');
    html = html.replace(/\{\{ansprechperson\}\}/gi, invoiceData.ansprechperson || '');
    html = html.replace(/\{\{ansprechpersonAnrede\}\}/gi, invoiceData.ansprechpersonAnrede || '');
    html = html.replace(/\{\{ansprechpersonAnredeBrief\}\}/gi, invoiceData.ansprechpersonAnredeBrief || '');
    html = html.replace(/\{\{ansprechpersonHoeflichkeitsanrede\}\}/gi, invoiceData.ansprechpersonHoeflichkeitsanrede || '');
    html = html.replace(/\{\{ansprechpersonVorname\}\}/gi, invoiceData.ansprechpersonVorname || '');
    html = html.replace(/\{\{ansprechpersonNachname\}\}/gi, invoiceData.ansprechpersonNachname || '');
    html = html.replace(/\{\{ansprechpersonName\}\}/gi, invoiceData.ansprechpersonName || invoiceData.ansprechperson || '');
    html = html.replace(/\{\{klientUnternehmenAnsprechperson\}\}/gi, invoiceData.klientUnternehmenAnsprechperson || '');
    html = html.replace(/\{\{klientUnternehmenAnsprechpersonAnrede\}\}/gi, invoiceData.klientUnternehmenAnsprechpersonAnrede || '');
    html = html.replace(/\{\{klientUnternehmenAnsprechpersonAnredeBrief\}\}/gi, invoiceData.klientUnternehmenAnsprechpersonAnredeBrief || '');
    html = html.replace(/\{\{kundeAnrede\}\}/gi, invoiceData.kundeAnrede || '');
    html = html.replace(/\{\{kundeAnredeBrief\}\}/gi, invoiceData.kundeAnredeBrief || '');
    html = html.replace(/\{\{kundeHoeflichkeitsanrede\}\}/gi, invoiceData.kundeHoeflichkeitsanrede || '');

    // Company address fields
    html = html.replace(/\{\{strasse\}\}/gi, invoiceData.strasse || '');
    html = html.replace(/\{\{hausnummer\}\}/gi, invoiceData.hausnummer || '');
    html = html.replace(/\{\{plz\}\}/gi, invoiceData.plz || '');
    html = html.replace(/\{\{ort\}\}/gi, invoiceData.ort || '');
    html = html.replace(/\{\{land\}\}/gi, invoiceData.land || 'CH');

    // Company contact fields
    html = html.replace(/\{\{telefon\}\}/gi, invoiceData.telefon || '');
    html = html.replace(/\{\{email\}\}/gi, invoiceData.email || '');
    html = html.replace(/\{\{website\}\}/gi, invoiceData.website || '');

    // Company financial fields
    html = html.replace(/\{\{iban\}\}/gi, invoiceData.iban || 'CH00 0000 0000 0000 0000 0');
    html = html.replace(/\{\{mwstnummer\}\}/gi, invoiceData.mwstnummer || '');
    html = html.replace(/\{\{vat\}\}/gi, invoiceData.mwstnummer || '');

    // Replace logo placeholder - convert to base64 for html2canvas compatibility
    if (invoiceData.logoUrl) {
      try {
        const logoData = await getBase64ImageWithDimensions(invoiceData.logoUrl);
        html = html.replace(/\{\{logo\}\}/gi, `<img src="${logoData.base64}" alt="Firmenlogo" style="max-width: 200px; max-height: 100px; object-fit: contain;" />`);
      } catch {
        // Fallback to original URL if conversion fails
        html = html.replace(/\{\{logo\}\}/gi, `<img src="${invoiceData.logoUrl}" alt="Firmenlogo" style="max-width: 200px; max-height: 100px; object-fit: contain;" />`);
      }
    } else {
      html = html.replace(/\{\{logo\}\}/gi, ''); // Remove placeholder if no logo
    }

    // Replace QR code placeholder with Swiss QR Bill
    // Standard size for Swiss QR Bill is 210mm x 105mm (A4 width x half height)
    if (qrCodeDataUrl) {
      html = html.replace(
        /\{\{qr-code\}\}/gi,
        `<img src="${qrCodeDataUrl}" alt="Swiss QR-Rechnung" style="width: 100%; max-width: 210mm; height: auto; display: block;" />`
      );
      html = html.replace(/\{\{qrCodeDataUrl\}\}/gi, qrCodeDataUrl);
    } else {
      html = html.replace(/\{\{qr-code\}\}/gi, '');
      html = html.replace(/\{\{qrCodeDataUrl\}\}/gi, '');
    }

    // Replace positions loop - handle both table format and individual placeholders
    const positionsRegex = /\{\{#each positionen\}\}([\s\S]*?)\{\{\/each\}\}/g;
    html = html.replace(positionsRegex, (match, template) => {
      return invoiceData.positionen.map(pos => {
        const posTotal = (pos.menge * pos.preis).toFixed(2);
        let posHtml = template;

        // Replace individual position placeholders
        posHtml = posHtml.replace(/\{\{beschreibung\}\}/g, pos.beschreibung || '');
        posHtml = posHtml.replace(/\{\{menge\}\}/g, pos.menge.toString());
        posHtml = posHtml.replace(/\{\{einzelpreis\}\}/g, pos.preis.toFixed(2));
        posHtml = posHtml.replace(/\{\{preis\}\}/g, pos.preis.toFixed(2));
        posHtml = posHtml.replace(/\{\{gesamtpreis\}\}/g, posTotal);
        posHtml = posHtml.replace(/\{\{total\}\}/g, posTotal);

        return posHtml;
      }).join('');
    });

    // Handle conditional blocks for QR code
    if (qrCodeDataUrl) {
      html = html.replace(/\{\{#if qrCodeData\}\}/g, '');
      html = html.replace(/\{\{\/if\}\}/g, '');
    } else {
      html = html.replace(/\{\{#if qrCodeData\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    }

    html = html.replace(/\{\{[^}]+\}\}/g, '');

    // Wrap with full HTML structure - respektiert die Original-Vorlage
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    /* Original Template CSS - hat Priorität */
    ${css}

    /* Minimale Print-Styles ohne Layout-Zwang */
    @page {
      size: A4;
      margin: 0;
    }

    html, body {
      margin: 0;
      padding: 0;
    }

    /* Platzhalter-Highlighting entfernen - sollen wie normaler Text aussehen */
    .invoice-placeholder {
      background-color: transparent !important;
      color: inherit !important;
      padding: 0 !important;
      border: none !important;
      border-radius: 0 !important;
      font-weight: inherit !important;
      display: inline !important;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>
    `;
  };

  const htmlToPdf = async (htmlContent: string, cssContent: string): Promise<Blob> => {
    // Use Supabase Edge Function to render HTML, then convert to PDF client-side
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Generate QR Code before sending to edge function
    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await generateQRCode();
    } catch {
      // Continue without QR code if generation fails
    }

    // Prepare invoice data for the edge function
    const formattedDatum = formatDateToSwiss(invoiceData.datum);
    const formattedFaelligkeitsdatum = formatDateToSwiss(invoiceData.faelligkeitsdatum);
    const formattedKlientGeburtstag = formatDateToSwiss(invoiceData.klientGeburtstag || invoiceData.geburtstag);

    const invoiceDataForEdge = {
      ...invoiceData,
      datum: formattedDatum,
      faelligkeitsdatum: formattedFaelligkeitsdatum,
      klientGeburtstag: formattedKlientGeburtstag,
      geburtstag: formattedKlientGeburtstag,
      positionen: invoiceData.positionen.map(pos => ({
        beschreibung: pos.beschreibung,
        menge: pos.menge.toString(),
        preis: pos.preis.toFixed(2),
        einzelpreis: pos.preis.toFixed(2),
        total: (pos.menge * pos.preis).toFixed(2),
        gesamtpreis: (pos.menge * pos.preis).toFixed(2),
      })),
      betrag: invoiceData.total.toFixed(2),
      zwischensumme: invoiceData.total.toFixed(2),
      offenerBetrag: invoiceData.total.toFixed(2),
      mwst: (invoiceData.total * 0.077).toFixed(2),
      // Add QR code as data URL so edge function can use it
      'qr-code': qrCodeDataUrl,
      qrCodeDataUrl: qrCodeDataUrl,
    };

    try {
      const response = await supabase.functions.invoke('generate-invoice-pdf', {
        body: {
          templateId: selectedTemplate.id,
          invoiceData: invoiceDataForEdge,
          userId: user.id,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'HTML rendering failed');
      }

      // The edge function returns rendered HTML
      if (response.data) {
        // Check if data has the expected structure
        if (response.data.success && response.data.html) {
          return await htmlToPdfFallback(response.data.html, response.data.deckblattHtml ?? null);
        }

        if (typeof response.data === 'string') {
          return await htmlToPdfFallback(response.data, null);
        }
      }

      throw new Error(`Invalid response format. Expected {success: true, html: string}, got: ${JSON.stringify(response.data)}`);
    } catch {
      // Fallback to local rendering if edge function fails
      toast({
        title: 'Info',
        description: 'Verwende lokale HTML-Rendering',
      });
      // Render HTML locally and convert to PDF
      const renderedHtml = await renderHtmlWithData(htmlContent, cssContent);
      return await htmlToPdfFallback(renderedHtml, null);
    }
  };

  const htmlToPdfFallback = async (
    htmlContent: string,
    deckblattHtml: string | null,
  ): Promise<Blob> => {
    // Create a temporary div for the invoice HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    document.body.appendChild(tempDiv);

    // Optional second temp div for the deckblatt (cover page)
    let deckblattDiv: HTMLElement | null = null;
    if (deckblattHtml) {
      deckblattDiv = document.createElement('div');
      deckblattDiv.innerHTML = deckblattHtml;
      deckblattDiv.style.position = 'absolute';
      deckblattDiv.style.left = '-9999px';
      deckblattDiv.style.top = '0';
      document.body.appendChild(deckblattDiv);
    }

    try {
      const html2canvas = (await import('html2canvas')).default;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 210;
      const pdfHeight = 297;

      const renderToPage = async (element: HTMLElement, isFirstPage: boolean) => {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 794,
          windowHeight: 1123,
        });
        const imgData = canvas.toDataURL('image/png');
        const canvasRatio = canvas.height / canvas.width;
        let imgWidth = pdfWidth;
        let imgHeight = pdfWidth * canvasRatio;
        if (imgHeight > pdfHeight) {
          imgHeight = pdfHeight;
          imgWidth = pdfHeight / canvasRatio;
        }
        const xOffset = (pdfWidth - imgWidth) / 2;
        if (!isFirstPage) pdf.addPage();
        pdf.addImage(imgData, 'PNG', xOffset, 0, imgWidth, imgHeight);
      };

      let isFirstPage = true;

      // Page 1: Deckblatt (if present)
      if (deckblattDiv) {
        const deckblattBody = deckblattDiv.querySelector('body') || deckblattDiv;
        await renderToPage(deckblattBody as HTMLElement, isFirstPage);
        isFirstPage = false;
      }

      // Find the invoice body and extract the QR page so it renders separately
      const bodyElement = tempDiv.querySelector('body') || tempDiv;
      const qrPage = bodyElement.querySelector('.qr-page');
      let qrPageClone: HTMLElement | null = null;
      if (qrPage) {
        qrPageClone = qrPage.cloneNode(true) as HTMLElement;
        (qrPage as HTMLElement).style.display = 'none';
      }

      // Page 2 (or 1): Invoice
      await renderToPage(bodyElement as HTMLElement, isFirstPage);
      isFirstPage = false;

      // Page 3 (or 2): QR Bill page
      if (qrPageClone) {
        const qrContainer = document.createElement('div');
        qrContainer.style.position = 'absolute';
        qrContainer.style.left = '-9999px';
        qrContainer.style.top = '0';
        qrContainer.appendChild(qrPageClone);
        document.body.appendChild(qrContainer);
        try {
          await renderToPage(qrPageClone, false);
        } finally {
          document.body.removeChild(qrContainer);
        }
      }

      return pdf.output('blob');
    } finally {
      if (tempDiv.parentNode) document.body.removeChild(tempDiv);
      if (deckblattDiv && deckblattDiv.parentNode) document.body.removeChild(deckblattDiv);
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      setIsGenerating(true);

      // Validation
      if (!selectedTemplate) {
        toast({
          title: 'Fehler',
          description: 'Bitte wählen Sie ein Template aus',
          variant: 'destructive',
        });
        return;
      }

      if (!invoiceData.firma || !invoiceData.rechnungsnummer) {
        toast({
          title: 'Fehler',
          description: 'Bitte füllen Sie Firma und Rechnungsnummer aus',
          variant: 'destructive',
        });
        return;
      }

      // Render HTML with data
      const htmlContent = selectedTemplate.editable_html || selectedTemplate.html_content || '';
      const cssContent = selectedTemplate.editable_css || selectedTemplate.css_content || '';

      const renderedHtml = await renderHtmlWithData(htmlContent, cssContent);

      // Convert to PDF using Puppeteer edge function (better quality)
      const pdfBlob = await htmlToPdf(renderedHtml, cssContent);

      // Download PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rechnung_${invoiceData.rechnungsnummer}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      // Upload to Supabase Storage
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const fileName = `${user.id}/${invoiceData.firma}/${invoiceData.rechnungsnummer}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from('INVOICES')
          .upload(fileName, pdfBlob, {
            contentType: 'application/pdf',
            upsert: true,
          });

        if (uploadError) {
          toast({
            title: 'Warnung',
            description: 'Rechnung wurde heruntergeladen, aber nicht in Supabase gespeichert',
            variant: 'default',
          });
        } else {
          toast({
            title: 'Erfolg',
            description: 'Rechnung wurde generiert und gespeichert',
          });
        }
      } else {
        toast({
          title: 'Erfolg',
          description: 'Rechnung wurde heruntergeladen',
        });
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Rechnung konnte nicht generiert werden',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rechnung aus HTML-Template generieren</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Selection */}
          <div>
            <Label>HTML-Template auswählen</Label>
            <select
              className="w-full mt-1 p-2 border rounded-md"
              value={selectedTemplate?.id || ''}
              onChange={(e) => {
                const template = templates.find((t) => t.id === e.target.value);
                setSelectedTemplate(template);
              }}
            >
              <option value="">-- Template wählen --</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Company, Client and Month Selection */}
          <div className={isSingleLevel ? "grid grid-cols-2 gap-4" : "grid grid-cols-3 gap-4"}>
            <div>
              <Label>{isSingleLevel ? "Kunde auswählen" : "Firma auswählen"}</Label>
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder={isSingleLevel ? "Kunde wählen" : "Firma wählen"} />
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
            {!isSingleLevel && (
              <div>
                <Label>Kunde auswählen</Label>
                <Select
                  value={selectedClientId}
                  onValueChange={setSelectedClientId}
                  disabled={!selectedCompanyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedCompanyId ? "Kunde wählen" : "Zuerst Firma wählen"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.first_name} {client.last_name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-clients" disabled>
                        Keine Kunden für diese Firma
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Monat</Label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                disabled={isSingleLevel ? !selectedCompanyId : !selectedClientId}
              />
            </div>
          </div>

          {/* Show time entries info */}
          {timeEntries.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>{timeEntries.length} Zeiteinträge</strong> gefunden für diesen Monat
                ({timeEntries.reduce((sum, e) => sum + (e.total_hours || 0), 0).toFixed(2)} Stunden)
              </p>
            </div>
          )}

          {/* Invoice Data */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Firma</Label>
              <Input
                value={invoiceData.firma}
                onChange={(e) => setInvoiceData({ ...invoiceData, firma: e.target.value })}
                placeholder="Kohler Elektro AG"
              />
            </div>
            <div>
              <Label>Rechnungsnummer</Label>
              <Input
                value={invoiceData.rechnungsnummer}
                onChange={(e) => setInvoiceData({ ...invoiceData, rechnungsnummer: e.target.value })}
                placeholder="RE-2025-006"
              />
            </div>
            <div>
              <Label>Datum</Label>
              <Input
                type="date"
                value={invoiceData.datum}
                onChange={(e) => setInvoiceData({ ...invoiceData, datum: e.target.value })}
              />
            </div>
            <div>
              <Label>Swiss QR-Rechnung</Label>
              <div className="text-sm text-gray-500 p-2 bg-blue-50 rounded">
                Der Swiss QR-Code wird automatisch generiert mit IBAN, Rechnungsnummer und Betrag.
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <Label>Firmenlogo (optional)</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) {
                    toast({
                      title: 'Fehler',
                      description: 'Sie müssen angemeldet sein',
                      variant: 'destructive',
                    });
                    return;
                  }

                  try {
                    // Upload logo to Supabase storage
                    const fileName = `${user.id}/logos/${Date.now()}_${file.name}`;
                    const { data, error } = await supabase.storage
                      .from('invoice_templates')
                      .upload(fileName, file);

                    if (error) throw error;

                    // Get public URL
                    const { data: { publicUrl } } = supabase.storage
                      .from('invoice_templates')
                      .getPublicUrl(data.path);

                    setInvoiceData({ ...invoiceData, logoUrl: publicUrl });
                    toast({
                      title: 'Logo hochgeladen',
                      description: 'Das Logo wurde erfolgreich hochgeladen',
                    });
                  } catch (error) {
                    toast({
                      title: 'Fehler',
                      description: 'Logo konnte nicht hochgeladen werden',
                      variant: 'destructive',
                    });
                  }
                }}
              />
              {invoiceData.logoUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInvoiceData({ ...invoiceData, logoUrl: '' })}
                >
                  Logo entfernen
                </Button>
              )}
            </div>
            {invoiceData.logoUrl && (
              <img
                src={invoiceData.logoUrl}
                alt="Logo-Vorschau"
                className="mt-2 max-w-[200px] max-h-[100px] object-contain border p-2"
              />
            )}
          </div>

          {/* Positions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Positionen</Label>
              <Button size="sm" onClick={addPosition} variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Position hinzufügen
              </Button>
            </div>

            <div className="space-y-2">
              {invoiceData.positionen.map((pos, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Input
                      placeholder="Beschreibung"
                      value={pos.beschreibung}
                      onChange={(e) => updatePosition(index, 'beschreibung', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Menge"
                      value={pos.menge}
                      onChange={(e) => updatePosition(index, 'menge', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Preis"
                      value={pos.preis}
                      onChange={(e) => updatePosition(index, 'preis', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input value={`CHF ${(pos.menge * pos.preis).toFixed(2)}`} disabled />
                  </div>
                  <div className="col-span-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removePosition(index)}
                      disabled={invoiceData.positionen.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-right">
              <span className="text-lg font-bold">Total: CHF {invoiceData.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateInvoice}
            disabled={isGenerating || !selectedTemplate}
            className="w-full"
          >
            <FileDown className="w-4 h-4 mr-2" />
            {isGenerating ? 'Wird generiert...' : 'Rechnung generieren'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
