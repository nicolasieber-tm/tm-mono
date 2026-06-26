import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SwissQRBill } from 'swissqrbill/svg';

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number };
}

interface QRBillData {
  currency: string;
  amount: number;
  reference: string;
  creditor: {
    account: string;
    name: string;
    address: string;
    buildingNumber: string;
    zip: string;
    city: string;
    country: string;
  };
  message: string;
  debtor?: {
    name: string;
    address: string;
    buildingNumber: string;
    zip: string;
    city: string;
    country: string;
  };
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
  buildingNumber: string;
  zip: number;
  city: string;
  country: string;
  iban: string;
}

/**
 * Generates ISO 11649 Creditor Reference from invoice number
 * Used with normal IBAN (not QR-IBAN)
 */
function generateCreditorReference(invoiceNumber: string): string {
  // Remove special characters and convert to uppercase
  const cleanNumber = invoiceNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase();

  // Convert letters to numbers (A=10, B=11, ..., Z=35)
  let numericString = '';
  for (let i = 0; i < cleanNumber.length; i++) {
    const char = cleanNumber[i];
    if (char >= '0' && char <= '9') {
      numericString += char;
    } else {
      numericString += (char.charCodeAt(0) - 55).toString();
    }
  }

  // Add RF placeholder (RF = 27 15, 00 as placeholder)
  numericString += '271500';

  // Calculate modulo 97
  let remainder = '';
  for (let i = 0; i < numericString.length; i++) {
    const temp = remainder + numericString[i];
    remainder = (parseInt(temp) % 97).toString();
  }

  // Calculate check digits
  const checkDigits = (98 - parseInt(remainder)).toString().padStart(2, '0');

  return `RF${checkDigits}${cleanNumber}`;
}

/**
 * Parse client address into structured format for Swiss QR Bill
 */
function parseClientAddress(clientAddress: string, clientName: string): {
  name: string;
  address: string;
  buildingNumber: string;
  zip: number;
  city: string;
  country: string;
} | undefined {
  if (!clientAddress) return undefined;

  const parts = clientAddress.split(',').map(p => p.trim());

  // Try to parse: "Street Number, ZIP City"
  const streetPart = parts[0] || '';
  const zipCityPart = parts[parts.length - 1] || '';

  // Extract street and building number
  const streetMatch = streetPart.match(/^(.+?)\s+(\d+[a-zA-Z]?)$/);
  const address = streetMatch ? streetMatch[1] : streetPart;
  const buildingNumber = streetMatch ? streetMatch[2] : '';

  // Extract ZIP and city
  const zipCityMatch = zipCityPart.match(/^(\d{4})\s+(.+)$/);
  const zip = zipCityMatch ? parseInt(zipCityMatch[1]) : 0;
  const city = zipCityMatch ? zipCityMatch[2] : zipCityPart;

  return {
    name: clientName,
    address,
    buildingNumber,
    zip,
    city,
    country: 'CH',
  };
}

/**
 * Convert SVG string to data URL for embedding in PDF
 */
async function svgToDataURL(svgString: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Swiss QR Bill is 210mm x 105mm at 96 DPI
      const scale = 2; // Higher resolution for printing
      canvas.width = 794 * scale; // 210mm in pixels
      canvas.height = 397 * scale; // 105mm in pixels

      ctx.scale(scale, scale);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0);

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      URL.revokeObjectURL(url);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG'));
    };

    img.src = url;
  });
}

/**
 * Generates a Swiss-compliant invoice PDF with Swiss QR-Bill
 */
export async function generateSwissQRInvoicePDF(
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
  doc.text(`${companyInfo.address} ${companyInfo.buildingNumber}`, 20, 28);
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
  const tableData = invoiceData.timeEntries.flatMap(entry => {
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
  });

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

  // Generate ISO 11649 Creditor Reference
  const reference = generateCreditorReference(invoiceData.invoice_number);

  // Parse client address for debtor
  const debtor = parseClientAddress(invoiceData.client_address || '', invoiceData.client_name);

  // Create Swiss QR Bill data
  const qrBillData: QRBillData = {
    currency: 'CHF',
    amount: invoiceData.total,
    reference: reference,
    creditor: {
      account: companyInfo.iban,
      name: companyInfo.name,
      address: companyInfo.address,
      buildingNumber: companyInfo.buildingNumber,
      zip: companyInfo.zip,
      city: companyInfo.city,
      country: companyInfo.country,
    },
    message: `Rechnung ${invoiceData.invoice_number}`,
  };

  // Add debtor if available
  if (debtor) {
    qrBillData.debtor = debtor;
  }

  // Generate Swiss QR Bill SVG
  const qrBill = new SwissQRBill(qrBillData);
  const svgString = qrBill.toString();

  // Convert SVG to data URL
  const qrBillDataURL = await svgToDataURL(svgString);

  // Add new page for QR Bill
  doc.addPage();

  // Add Swiss QR Bill to PDF
  // Swiss QR Bill is 210mm x 105mm, positioned at bottom of A4 page
  doc.addImage(qrBillDataURL, 'PNG', 0, 192, 210, 105);

  return doc.output('blob');
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-CH');
}
