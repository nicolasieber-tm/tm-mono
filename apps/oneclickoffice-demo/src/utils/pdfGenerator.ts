import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number };
}

interface InvoiceData {
  invoice_number: string;
  period_start: string;
  period_end: string;
  subtotal: number;
  vat_amount: number;
  total: number;
  company_name: string;
  client_name: string;
  client_address?: string;
  timeEntries: Array<{
    date: string;
    activity_description: string;
    total_hours: number;
    hourly_rate: number;
    labor_cost: number;
    travel_from?: string;
    travel_to?: string;
    travel_distance_km?: number;
    travel_expense_amount?: number;
  }>;
}

interface CompanyInfo {
  name: string;
  address: string;
  zip: string;
  city: string;
  iban: string;
  reference?: string;
}

/**
 * Generates a Swiss QR-Bill compliant QR code according to ISO 20022 standard
 *
 * Note: This generates a standard QR code. For the official Swiss QR code with
 * the Swiss cross overlay, use the PHP microservice (see PHP_SERVICE_DEPLOYMENT.md)
 */
async function generateSwissQRCode(
  amount: number,
  reference: string,
  iban: string,
  creditor: CompanyInfo,
  debtor?: { name: string; address: string; zip: string; city: string }
): Promise<string> {
  // Swiss QR-Bill format (ISO 20022) - Version 2.0
  // Reference: https://www.paymentstandards.ch/dam/downloads/ig-qr-bill-en.pdf

  const qrData = [
    'SPC',                              // QR Type (Swiss Payments Code)
    '0200',                             // Version (2.0)
    '1',                                // Coding Type (1=UTF-8)
    iban.replace(/\s/g, ''),            // IBAN (without spaces)
    'K',                                // Creditor Address Type (K=combined, S=structured)
    creditor.name,                      // Creditor Name (max 70 chars)
    creditor.address,                   // Creditor Address Line 1
    creditor.zip + ' ' + creditor.city, // Creditor Address Line 2
    '',                                 // Creditor Address Line 3 (empty)
    '',                                 // Creditor Address Line 4 (empty)
    '',                                 // Creditor Address Line 5 (empty)
    '',                                 // Creditor Country (empty = CH)
    // Ultimate Creditor (7 fields, all empty)
    '', '', '', '', '', '', '',
    amount.toFixed(2),                  // Amount (2 decimals)
    'CHF',                              // Currency (CHF, EUR)
    // Ultimate Debtor (7 fields)
    debtor ? 'K' : '',                  // Debtor Address Type
    debtor?.name || '',                 // Debtor Name
    debtor?.address || '',              // Debtor Address Line 1
    debtor ? (debtor.zip + ' ' + debtor.city) : '', // Debtor Address Line 2
    '', '', '',                         // Debtor Address Lines 3-5
    'QRR',                              // Reference Type (QRR, SCOR, NON)
    reference,                          // QR Reference (27 digits with check digit)
    '',                                 // Unstructured Message (max 140 chars)
    'EPD',                              // Trailer (End Payment Data)
    '',                                 // Alternative Procedures (optional)
  ].join('\r\n'); // Use CRLF as per specification

  // Generate QR code with error correction level M (required for Swiss QR)
  return await QRCode.toDataURL(qrData, {
    errorCorrectionLevel: 'M', // Medium error correction (15%)
    width: 200,
    margin: 0,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
}

/**
 * Generates a Swiss-compliant invoice PDF with QR-Bill
 */
export async function generateInvoicePDF(
  invoiceData: InvoiceData,
  companyInfo: CompanyInfo
): Promise<Blob> {
  const doc = new jsPDF();

  // Set font
  doc.setFont('helvetica');

  // Header - Company Logo/Name
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name, 20, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(companyInfo.address, 20, 28);
  doc.text(`${companyInfo.zip} ${companyInfo.city}`, 20, 33);

  // Invoice Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RECHNUNG', 20, 50);

  // Invoice Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Rechnungsnummer: ${invoiceData.invoice_number}`, 20, 60);
  doc.text(`Datum: ${new Date().toLocaleDateString('de-CH')}`, 20, 65);
  doc.text(`Periode: ${formatDate(invoiceData.period_start)} - ${formatDate(invoiceData.period_end)}`, 20, 70);

  // Client Address
  doc.setFont('helvetica', 'bold');
  doc.text('Rechnungsempfänger:', 120, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.client_name, 120, 65);
  doc.text(invoiceData.company_name, 120, 70);
  if (invoiceData.client_address) {
    doc.text(invoiceData.client_address, 120, 75);
  }

  // Table with time entries
  const tableData = invoiceData.timeEntries.map(entry => {
    const rows = [];

    // Main entry row
    rows.push([
      formatDate(entry.date),
      entry.activity_description || '-',
      `${entry.total_hours}h`,
      `CHF ${entry.hourly_rate.toFixed(2)}`,
      `CHF ${entry.labor_cost.toFixed(2)}`
    ]);

    // Travel row if exists
    if (entry.travel_from && entry.travel_to && entry.travel_expense_amount) {
      rows.push([
        '',
        `Fahrt: ${entry.travel_from} → ${entry.travel_to}`,
        `${entry.travel_distance_km?.toFixed(1)} km`,
        '',
        `CHF ${entry.travel_expense_amount.toFixed(2)}`
      ]);
    }

    return rows;
  }).flat();

  autoTable(doc, {
    startY: 85,
    head: [['Datum', 'Beschreibung', 'Menge', 'Preis', 'Betrag']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [66, 66, 66] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 80 },
      2: { cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30, halign: 'right' },
    },
  });

  // Get Y position after table
  const finalY = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 10;

  // Totals
  doc.setFont('helvetica', 'normal');
  doc.text('Zwischensumme:', 140, finalY);
  doc.text(`CHF ${invoiceData.subtotal.toFixed(2)}`, 180, finalY, { align: 'right' });

  doc.text('MwSt. 7.7%:', 140, finalY + 5);
  doc.text(`CHF ${invoiceData.vat_amount.toFixed(2)}`, 180, finalY + 5, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total:', 140, finalY + 12);
  doc.text(`CHF ${invoiceData.total.toFixed(2)}`, 180, finalY + 12, { align: 'right' });

  // Payment info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Zahlbar innert 30 Tagen', 20, finalY + 25);

  // Swiss QR-Bill section (on bottom of page or new page)
  const qrY = Math.max(finalY + 40, 220);

  if (qrY > 250) {
    doc.addPage();
  }

  // Generate QR reference number (27 digits with check digit)
  const reference = companyInfo.reference || invoiceData.invoice_number.replace(/[^0-9]/g, '').padStart(27, '0');

  // Parse client address for debtor information
  const clientAddressParts = invoiceData.client_address?.split(',') || [];
  const clientZipCity = clientAddressParts[clientAddressParts.length - 1]?.trim() || '';
  const clientZipCityMatch = clientZipCity.match(/^(\d{4})\s+(.+)$/);

  const debtorInfo = invoiceData.client_address ? {
    name: invoiceData.client_name,
    address: clientAddressParts[0]?.trim() || '',
    zip: clientZipCityMatch?.[1] || '',
    city: clientZipCityMatch?.[2] || clientZipCity,
  } : undefined;

  // Generate QR code with debtor information
  const qrCodeDataUrl = await generateSwissQRCode(
    invoiceData.total,
    reference,
    companyInfo.iban,
    companyInfo,
    debtorInfo
  );

  // Draw QR-Bill section
  const qrStartY = qrY > 250 ? 20 : qrY;

  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(20, qrStartY, 190, qrStartY); // Separator line

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Zahlteil', 20, qrStartY + 10);

  // QR Code
  doc.addImage(qrCodeDataUrl, 'PNG', 20, qrStartY + 15, 50, 50);

  // Payment information next to QR
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Konto / Zahlbar an', 80, qrStartY + 20);
  doc.setFont('helvetica', 'normal');
  doc.text(companyInfo.iban, 80, qrStartY + 25);
  doc.text(companyInfo.name, 80, qrStartY + 30);
  doc.text(`${companyInfo.zip} ${companyInfo.city}`, 80, qrStartY + 35);

  doc.setFont('helvetica', 'bold');
  doc.text('Referenz', 80, qrStartY + 45);
  doc.setFont('helvetica', 'normal');
  doc.text(reference, 80, qrStartY + 50);

  doc.setFont('helvetica', 'bold');
  doc.text('Zahlbar durch', 80, qrStartY + 60);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.client_name, 80, qrStartY + 65);

  // Amount section
  doc.setFont('helvetica', 'bold');
  doc.text('Währung', 140, qrStartY + 20);
  doc.setFont('helvetica', 'normal');
  doc.text('CHF', 140, qrStartY + 25);

  doc.setFont('helvetica', 'bold');
  doc.text('Betrag', 155, qrStartY + 20);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.total.toFixed(2), 155, qrStartY + 25);

  return doc.output('blob');
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-CH');
}
