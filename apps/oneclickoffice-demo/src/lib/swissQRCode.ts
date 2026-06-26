import { SwissQRBill } from 'swissqrbill/svg';

/**
 * Generates a creditor reference (RF reference) according to ISO 11649
 * @param invoiceNumber - The invoice number to convert to a reference
 * @returns RF reference string (e.g., "RF18123456")
 */
function generateCreditorReference(invoiceNumber: string): string {
  // Remove all non-alphanumeric characters and convert to uppercase
  const cleanNumber = invoiceNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase();

  // Convert letters to numbers (A=10, B=11, ..., Z=35)
  let numericString = '';
  for (let i = 0; i < cleanNumber.length; i++) {
    const char = cleanNumber[i];
    if (char >= '0' && char <= '9') {
      numericString += char;
    } else {
      // Convert letter to number (A=10, B=11, etc.)
      numericString += (char.charCodeAt(0) - 55).toString();
    }
  }

  // Append RF and two check digits placeholder (271500 = "RF00")
  numericString += '271500';

  // Calculate mod 97
  let remainder = '';
  for (let i = 0; i < numericString.length; i++) {
    const digit = numericString[i];
    const temp = remainder + digit;
    remainder = (parseInt(temp) % 97).toString();
  }

  // Calculate check digits
  const checkDigits = (98 - parseInt(remainder)).toString().padStart(2, '0');

  return `RF${checkDigits}${cleanNumber}`;
}

export interface SwissQRCodeData {
  iban: string;
  creditor: {
    name: string;
    address: string;
    buildingNumber?: string;
    zip: string;
    city: string;
    country: string;
  };
  amount?: number;
  currency: string;
  debtor?: {
    name: string;
    address?: string;
    buildingNumber?: string;
    zip?: string;
    city?: string;
    country?: string;
  };
  reference?: string;
  additionalInfo?: string;
}

/**
 * Generates a Swiss QR Code as a PNG data URL
 * @param data - The QR code data (creditor, debtor, amount, etc.)
 * @returns Promise with PNG data URL
 */
export async function generateSwissQRCode(data: SwissQRCodeData): Promise<string> {
  // Generate creditor reference if invoice number is provided
  const creditorRef = data.reference ? generateCreditorReference(data.reference) : undefined;

  // Prepare debtor data - only include if we have at least name and zip
  // The swissqrbill library requires zip if debtor is provided
  let debtorData = undefined;
  if (data.debtor && data.debtor.name && data.debtor.zip) {
    debtorData = {
      name: data.debtor.name,
      address: data.debtor.address || '',
      buildingNumber: data.debtor.buildingNumber || undefined,
      zip: parseInt(data.debtor.zip),
      city: data.debtor.city || '',
      country: data.debtor.country || 'CH',
    };
  }

  // Prepare QR bill data
  // Note: swissqrbill library expects address and buildingNumber as SEPARATE fields
  const qrBillData = {
    currency: data.currency,
    amount: data.amount,
    reference: creditorRef,
    creditor: {
      account: data.iban,
      name: data.creditor.name,
      address: data.creditor.address,
      buildingNumber: data.creditor.buildingNumber || undefined,
      zip: parseInt(data.creditor.zip),
      city: data.creditor.city,
      country: data.creditor.country,
    },
    debtor: debtorData,
    message: data.additionalInfo,
  };

  // Generate QR bill as SVG
  const qrBill = new SwissQRBill(qrBillData);
  const svgString = qrBill.toString();

  // Convert SVG to PNG data URL
  return new Promise<string>((resolve, reject) => {
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
      // High resolution for better quality
      const scale = 4;
      const width = img.width || 210;
      const height = img.height || 105;

      canvas.width = width * scale;
      canvas.height = height * scale;

      ctx.scale(scale, scale);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      const pngDataUrl = canvas.toDataURL('image/png', 1.0);
      resolve(pngDataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG'));
    };

    img.src = url;
  });
}

/**
 * Helper function to parse address string into street and building number
 * @param fullAddress - Full address string (e.g., "Hauptstrasse 123")
 * @returns Object with street and building number
 */
export function parseAddress(fullAddress?: string | null): { street: string; number?: string } {
  if (!fullAddress) return { street: '', number: undefined };

  // Try to extract building number from address (e.g., "Hauptstrasse 123" -> "Hauptstrasse", "123")
  const match = fullAddress.match(/^(.+?)\s+(\d+[a-zA-Z]?)$/);
  if (match) {
    return { street: match[1].trim(), number: match[2] };
  }

  return { street: fullAddress, number: undefined };
}
