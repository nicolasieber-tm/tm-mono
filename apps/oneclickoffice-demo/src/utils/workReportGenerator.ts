import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number };
}
import { supabase } from '@/integrations/supabase/client';

/**
 * Interface für Zeiteinträge im Arbeitsrapport
 */
interface TimeEntry {
  date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  activity_description: string | null;
  category?: string | null;
}

/**
 * Helper function to convert image URL to Base64 and get its dimensions
 */
export async function getBase64ImageWithDimensions(url: string): Promise<{ base64: string; width: number; height: number }> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const img = new Image();
      img.onload = () => {
        resolve({ base64, width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = base64;
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function scaleLogoDimensions(
  originalWidth?: number,
  originalHeight?: number,
  maxWidth = 45,
  maxHeight = 25
) {
  if (!originalWidth || !originalHeight) {
    return { width: maxWidth, height: maxHeight };
  }

  const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
  return {
    width: originalWidth * ratio,
    height: originalHeight * ratio,
  };
}

/**
 * Interface für die Arbeitsrapport-Daten
 */
interface WorkReportData {
  // Firmendaten (Auftragnehmer)
  Firmenname: string;
  LogoBase64?: string;
  LogoWidth?: number;
  LogoHeight?: number;
  Firmenadresse: string;
  FirmenPLZOrt: string;
  FirmenTelefon: string;
  FirmenEmail: string;

  // Rapport-Informationen
  Datum: string;
  Rechnungsnummer: string;
  Projektname: string;
  Mitarbeitername: string;

  // Kundeninformationen
  Kundenname: string;
  Projektadresse: string;

  // Zeiteinträge
  Zeiteintraege: TimeEntry[];

  // Gesamtzeit
  Totalzeit: string;
}

/**
 * Formatiert Stunden in HH:MM Format
 */
function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}h`;
}

/**
 * Formatiert eine Zeit von HH:MM:SS zu HH:MM
 */
function formatTime(timeString: string): string {
  if (!timeString) return '';
  const parts = timeString.split(':');
  return `${parts[0]}:${parts[1]}`;
}

/**
 * Formatiert ein Datum von YYYY-MM-DD zu DD.MM.YYYY
 */
function formatDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}.${month}.${year}`;
}

/**
 * Formatiert ein Datum von YYYY-MM-DD zu "Monat Jahr" (z.B. "November 2025")
 */
function formatMonthYear(dateString: string): string {
  if (!dateString) return '';
  const [year, month] = dateString.split('-');
  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}

/**
 * Sanitizes a filename for Supabase Storage (removes special characters)
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, '_')  // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9._-]/g, '');  // Remove any other special characters
}

/**
 * Generiert einen Arbeitsrapport als PDF
 *
 * @param data - WorkReportData Objekt mit allen erforderlichen Feldern
 * @returns PDF als Blob
 */
export function generateWorkReportPDF(data: WorkReportData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // ===== 1. KOPFBEREICH (ZWEISPALTIG) =====

  // Linke Spalte - Auftragnehmer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(data.Firmenname, margin, yPos);

  doc.setFont('helvetica', 'normal');
  yPos += 5;
  doc.text(data.Firmenadresse, margin, yPos);
  yPos += 5;
  doc.text(data.FirmenPLZOrt, margin, yPos);
  yPos += 5;
  doc.text(`Telefon: ${data.FirmenTelefon}`, margin, yPos);
  yPos += 5;
  doc.text(`E-Mail: ${data.FirmenEmail}`, margin, yPos);

  // Rechte Spalte - Titel & Logo
  let yPosRight = 20;
  const rightColX = pageWidth / 2 + 10;

  // Logo rendern falls vorhanden
  if (data.LogoBase64) {
    try {
      const { width: logoWidth, height: logoHeight } = scaleLogoDimensions(
        data.LogoWidth,
        data.LogoHeight
      );
      const logoX = pageWidth - margin - logoWidth;
      const logoY = 15;

      doc.addImage(data.LogoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight, undefined, 'FAST');

      // Titel nach unten schieben wenn Logo da ist
      yPosRight = logoY + logoHeight + 10;
    } catch {
      // Fallback: Titel an normaler Position lassen
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  // Titel rechtsbündig ausrichten
  doc.text('ARBEITSRAPPORT', pageWidth - margin, yPosRight, { align: 'right' });

  // Horizontale Linie
  yPos = Math.max(yPos, yPosRight) + 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // ===== 2. ÜBERSICHT DER GELEISTETEN ARBEIT =====

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Übersicht der geleisteten Arbeit', margin, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  // Berechne Gesamtarbeitszeit
  const totalHours = data.Zeiteintraege.reduce((sum, entry) => sum + entry.total_hours, 0);

  // Bestimme Zeitraum (nur Monat und Jahr)
  const dates = data.Zeiteintraege.map(e => e.date).sort();
  const firstDate = dates[0] || data.Datum;
  const periodDisplay = formatMonthYear(firstDate);

  const overview = [
    `Zeitraum: ${periodDisplay}`,
    `Kunde: ${data.Kundenname}`,
    `Total Arbeitszeit: ${formatHours(totalHours)}`
  ];

  overview.forEach(line => {
    doc.text(line, margin, yPos);
    yPos += 5;
  });

  yPos += 5;

  // ===== 3. ZEITBLOCK-TABELLE =====

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Detaillierte Zeiterfassung', margin, yPos);
  yPos += 8;

  // Bereite Tabellendaten vor
  const monthlyCategories = new Set(['kurzkontakte ganzer monat']);
  const bottomCategories = new Set(['kurzkontakte ganzer monat']);

  const normalizedEntries = data.Zeiteintraege.map(entry => ({
    entry,
    normalizedCategory: (entry.category || '').trim().toLowerCase()
  }));

  const regularEntries = normalizedEntries.filter(item => !bottomCategories.has(item.normalizedCategory));
  const bottomEntries = normalizedEntries.filter(item => bottomCategories.has(item.normalizedCategory));
  const orderedEntries = [...regularEntries, ...bottomEntries];

  const tableData = orderedEntries.map(({ entry, normalizedCategory }) => {
    const hideDate = monthlyCategories.has(normalizedCategory);

    return [
      hideDate ? '' : formatDate(entry.date),
      entry.category || 'Allgemein',
      entry.activity_description || '-',
      formatHours(entry.total_hours)
    ];
  });

  // Erstelle Tabelle
  autoTable(doc, {
    startY: yPos,
    head: [['Datum', 'Kategorie', 'Aktivität', 'Dauer']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [70, 70, 70],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 30 },  // Datum
      1: { cellWidth: 35 },  // Kategorie
      2: { cellWidth: 'auto' },  // Aktivität
      3: { cellWidth: 25 }  // Dauer
    },
    margin: { left: margin, right: margin }
  });

  // Position nach Tabelle
  yPos = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 10;

  // ===== 4. ZUSAMMENFASSUNG =====

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Gesamtarbeitszeit: ${formatHours(totalHours)}`, margin, yPos);
  yPos += 10;

  // ===== 5. FUSSZEILE =====

  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);

  const footerLine1 = "Praxis Vogel GmbH, psychosoziale Beratung und Begleitung 078'731'76'78";
  const footerLine2 = "E-Mail: praxis-vogel@gmx.ch www.praxis-vogel.net";

  doc.text(footerLine1, pageWidth / 2, footerY, { align: 'center' });
  doc.text(footerLine2, pageWidth / 2, footerY + 4, { align: 'center' });

  return doc;
}

/**
 * Lädt Daten aus der Datenbank und generiert den Arbeitsrapport
 *
 * @param invoiceId - ID der Rechnung
 * @returns Promise mit dem Dateinamen und der Download-URL, oder null bei Fehler
 */
export async function generateWorkReportForInvoice(
  invoiceId: string
): Promise<{ filename: string; url: string; docUrl: string } | null> {
  try {
    // 1. Rechnung laden
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        kunden (
          name,
          address,
          city,
          zip,
          phone,
          email
        ),
        clients (
          first_name,
          last_name,
          address,
          city,
          zip
        )
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return null;
    }

    // 2. Zeiteinträge zur Rechnung laden
    const { data: timeEntries, error: timeEntriesError } = await supabase
      .from('time_entries')
      .select(`
        date,
        start_time,
        end_time,
        total_hours,
        activity_description,
        employee_id,
        employees (
          first_name,
          last_name
        ),
        category
      `)
      .eq('invoice_id', invoiceId)
      .eq('unternehmen_id', invoice.unternehmen_id)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (timeEntriesError) {
      return null;
    }

    if (!timeEntries || timeEntries.length === 0) {
      return null;
    }

    // 3. Firmeneinstellungen laden (Auftragnehmer)
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return null;
    }

    if (!invoice.unternehmen_id) {
      return null;
    }

    const { data: companySettings, error: companyError } = await supabase
      .from('unternehmen')
      .select('*')
      .eq('id', invoice.unternehmen_id)
      .maybeSingle();

    if (companyError || !companySettings) {
      return null;
    }

    // 4. Daten für den Arbeitsrapport zusammenstellen
    const company = invoice.kunden;
    const client = invoice.clients;

    // Mitarbeitername vom ersten Zeiteintrag
    const firstEntry = timeEntries[0];
    const employeeData = firstEntry.employees as { first_name: string; last_name: string } | null;
    const employeeName = employeeData
      ? `${employeeData.first_name} ${employeeData.last_name}`
      : 'Unbekannter Mitarbeiter';

    // Logo laden falls vorhanden
    let logoBase64: string | undefined = undefined;
    let logoWidth: number | undefined = undefined;
    let logoHeight: number | undefined = undefined;
    if (companySettings.logo_url) {
      try {
        const logoData = await getBase64ImageWithDimensions(companySettings.logo_url);
        logoBase64 = logoData.base64;
        logoWidth = logoData.width;
        logoHeight = logoData.height;
      } catch {
        // Logo loading failed, continue without logo
      }
    }

    const workReportData: WorkReportData = {
      // Firmendaten (Auftragnehmer)
      Firmenname: companySettings.company_name,
      LogoBase64: logoBase64,
      LogoWidth: logoWidth,
      LogoHeight: logoHeight,
      Firmenadresse: companySettings.address || '',
      FirmenPLZOrt: `${companySettings.zip || ''} ${companySettings.city || ''}`.trim(),
      FirmenTelefon: companySettings.phone || '',
      FirmenEmail: companySettings.email || '',

      // Rapport-Informationen
      Datum: formatDate(invoice.period_end),
      Rechnungsnummer: invoice.invoice_number,
      Projektname: company?.name || 'Unbekanntes Projekt',
      Mitarbeitername: employeeName,

      // Kundeninformationen
      // In single_level mode client is null; fall back to the kunden (company) name
      Kundenname: client
        ? `${client.first_name} ${client.last_name}`
        : company?.name || '',
      Projektadresse: client
        ? `${client.address || ''}, ${client.zip || ''} ${client.city || ''}`.trim()
        : company
          ? [company.address, `${company.zip || ''} ${company.city || ''}`.trim()]
              .filter(Boolean)
              .join(', ')
          : '',

      // Zeiteinträge
      Zeiteintraege: timeEntries.map(entry => ({
        date: entry.date,
        start_time: entry.start_time,
        end_time: entry.end_time,
        total_hours: entry.total_hours,
        activity_description: entry.activity_description,
        category: entry.category
      })),

      // Gesamtzeit
      Totalzeit: formatHours(timeEntries.reduce((sum, e) => sum + e.total_hours, 0))
    };

    // 5. PDF generieren
    const pdf = generateWorkReportPDF(workReportData);

    // 6. PDF in Supabase Storage hochladen
    const clientName = workReportData.Kundenname;
    const periodRange = `${formatDate(invoice.period_start)} - ${formatDate(invoice.period_end)}`;

    // Display filename (with umlauts and spaces for download)
    const displayFilename = `Arbeitsrapport ${clientName} ${periodRange}.pdf`;

    // Storage filename (sanitized for Supabase Storage)
    const storageFilename = sanitizeFilename(displayFilename);

    const pdfBlob = pdf.output('blob');

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('INVOICES')
      .upload(`work-reports/${user.user.id}/${storageFilename}`, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      return null;
    }

    // 7. Öffentliche URL generieren
    const { data: urlData } = supabase.storage
      .from('INVOICES')
      .getPublicUrl(`work-reports/${user.user.id}/${storageFilename}`);

    // 8. URL in der Datenbank speichern
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ work_report_url: urlData.publicUrl })
      .eq('id', invoiceId);

    // updateError is non-fatal - the file is uploaded successfully

    return {
      filename: displayFilename,  // Return display filename for user-friendly download
      url: urlData.publicUrl,
      docUrl: urlData.publicUrl // Kein Google Doc, daher gleiche URL
    };

  } catch {
    return null;
  }
}
