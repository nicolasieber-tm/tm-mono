import React from 'react';

interface InvoicePosition {
  beschreibung: string;
  menge: number;
  einzelpreis: number;
  gesamtpreis: number;
}

interface ProfessionalInvoiceTableProps {
  positionen: InvoicePosition[];
  zwischensumme: number;
  offenerBetrag: number;
  currency?: string;
}

/**
 * Professional Invoice Table Component
 * Matches the design of the reference invoice with:
 * - Gray header row
 * - Alternating row colors
 * - Right-aligned numbers
 * - Clean professional styling
 */
export const ProfessionalInvoiceTable: React.FC<ProfessionalInvoiceTableProps> = ({
  positionen,
  zwischensumme,
  offenerBetrag,
  currency = 'CHF',
}) => {
  return (
    <div className="w-full">
      {/* Invoice Heading */}
      <h2 className="text-2xl font-bold mb-6">Rechnung</h2>

      {/* Horizontal divider */}
      <div className="border-b border-gray-300 mb-4"></div>

      {/* Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Beschreibung</th>
            <th className="text-center py-3 px-4 font-semibold text-gray-700 w-24">Menge</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700 w-32">Einzelpreis</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700 w-32">Gesamtpreis</th>
          </tr>
        </thead>
        <tbody>
          {positionen.map((position, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
            >
              <td className="py-3 px-4 text-gray-800">{position.beschreibung}</td>
              <td className="py-3 px-4 text-center text-gray-800">{position.menge}</td>
              <td className="py-3 px-4 text-right text-gray-800">
                {currency}{position.einzelpreis.toFixed(2)}
              </td>
              <td className="py-3 px-4 text-right font-medium text-gray-800">
                {currency}{position.gesamtpreis.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Horizontal divider */}
      <div className="border-b border-gray-300 mt-4 mb-4"></div>

      {/* Totals Section */}
      <div className="flex justify-end">
        <div className="w-96 space-y-3">
          {/* Zwischensumme */}
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700 font-medium">Zwischensumme</span>
            <span className="text-gray-800 font-semibold">
              {currency}{zwischensumme.toFixed(2)}
            </span>
          </div>

          {/* Offener Betrag */}
          <div className="flex justify-between items-center py-3 border-t border-gray-300 mt-2">
            <span className="text-gray-900 font-bold text-lg">Offener Betrag</span>
            <span className="text-gray-900 font-bold text-lg">
              {currency}{offenerBetrag.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Generate HTML/CSS string for PDF generation
 * This creates a standalone HTML snippet that can be embedded in templates
 */
export const generateProfessionalTableHTML = (
  positionen: InvoicePosition[],
  zwischensumme: number,
  offenerBetrag: number,
  currency: string = 'CHF'
): string => {
  const css = `
    <style>
      .invoice-container {
        font-family: Arial, sans-serif;
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
      }

      .invoice-heading {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 24px;
        color: #000;
      }

      .divider {
        border-bottom: 1px solid #d1d5db;
        margin-bottom: 16px;
      }

      .invoice-table {
        width: 100%;
        border-collapse: collapse;
      }

      .invoice-table thead tr {
        background-color: #f3f4f6;
      }

      .invoice-table th {
        padding: 12px 16px;
        font-weight: 600;
        color: #374151;
      }

      .invoice-table th.left {
        text-align: left;
      }

      .invoice-table th.center {
        text-align: center;
        width: 100px;
      }

      .invoice-table th.right {
        text-align: right;
        width: 130px;
      }

      .invoice-table tbody tr:nth-child(even) {
        background-color: #f9fafb;
      }

      .invoice-table tbody tr:nth-child(odd) {
        background-color: #ffffff;
      }

      .invoice-table td {
        padding: 12px 16px;
        color: #1f2937;
      }

      .invoice-table td.left {
        text-align: left;
      }

      .invoice-table td.center {
        text-align: center;
      }

      .invoice-table td.right {
        text-align: right;
      }

      .invoice-table td.total {
        font-weight: 500;
      }

      .totals-section {
        display: flex;
        justify-content: flex-end;
        margin-top: 16px;
      }

      .totals-content {
        width: 400px;
      }

      .total-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
      }

      .total-row.subtotal {
        color: #374151;
        font-weight: 500;
      }

      .total-row.final {
        border-top: 1px solid #d1d5db;
        padding-top: 12px;
        margin-top: 8px;
        font-weight: bold;
        font-size: 18px;
        color: #000;
      }
    </style>
  `;

  const positionsHTML = positionen
    .map(
      (pos, index) => `
    <tr>
      <td class="left">${pos.beschreibung}</td>
      <td class="center">${pos.menge}</td>
      <td class="right">${currency}${pos.einzelpreis.toFixed(2)}</td>
      <td class="right total">${currency}${pos.gesamtpreis.toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
    ${css}
    <div class="invoice-container">
      <h2 class="invoice-heading">Rechnung</h2>
      <div class="divider"></div>

      <table class="invoice-table">
        <thead>
          <tr>
            <th class="left">Beschreibung</th>
            <th class="center">Menge</th>
            <th class="right">Einzelpreis</th>
            <th class="right">Gesamtpreis</th>
          </tr>
        </thead>
        <tbody>
          ${positionsHTML}
        </tbody>
      </table>

      <div class="divider" style="margin-top: 16px;"></div>

      <div class="totals-section">
        <div class="totals-content">
          <div class="total-row subtotal">
            <span>Zwischensumme</span>
            <span>${currency}${zwischensumme.toFixed(2)}</span>
          </div>
          <div class="total-row final">
            <span>Offener Betrag</span>
            <span>${currency}${offenerBetrag.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
};

export default ProfessionalInvoiceTable;
