/**
 * Professional Invoice Template
 * Matches the reference design with clean, modern styling
 */

export const professionalInvoiceTemplate = {
  name: 'Professional Invoice (Swiss Standard)',
  html: `
<div class="invoice-page">
  <!-- Header with Logo and Company Info -->
  <div class="header">
    <div class="logo-section">
      {{logo}}
    </div>
    <div class="company-info">
      <div class="company-name">{{firmenname}}</div>
      <div class="contact-person">Ihre Kontaktperson</div>
      <div>{{email}}</div>
    </div>
  </div>

  <!-- Recipient Address -->
  <div class="recipient">
    <div class="recipient-label">Rechnungsempfänger</div>
    <div class="recipient-company">{{firma}}</div>
    <div>{{ansprechperson}}</div>
    <div>{{strasse}}</div>
    <div>{{kanton}}</div>
  </div>

  <!-- Invoice Details -->
  <div class="invoice-details">
    <div class="detail-row">
      <span class="label">Rechnungsnummer</span>
      <span class="value">{{rechnungsnummer}}</span>
    </div>
    <div class="detail-row">
      <span class="label">Rechungsdatum</span>
      <span class="value">{{datum}}</span>
    </div>
    <div class="detail-row">
      <span class="label">Fälligkeitsdatum</span>
      <span class="value">{{faelligkeitsdatum}}</span>
    </div>
  </div>

  <!-- Rechnung Heading -->
  <h1 class="invoice-title">Rechnung</h1>
  <div class="divider"></div>

  <!-- Positions Table -->
  <table class="positions-table">
    <thead>
      <tr>
        <th class="col-description">Beschreibung</th>
        <th class="col-quantity">Menge</th>
        <th class="col-price">Einzelpreis</th>
        <th class="col-total">Gesamtpreis</th>
      </tr>
    </thead>
    <tbody>
      {{#each positionen}}
      <tr>
        <td class="col-description">{{beschreibung}}</td>
        <td class="col-quantity">{{menge}}</td>
        <td class="col-price">CHF{{einzelpreis}}</td>
        <td class="col-total">CHF{{gesamtpreis}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="divider"></div>

  <!-- Totals Section -->
  <div class="totals-section">
    <div class="total-row subtotal">
      <span>Zwischensumme</span>
      <span>CHF{{zwischensumme}}</span>
    </div>
    <div class="total-row final-total">
      <span>Offener Betrag</span>
      <span>CHF{{offenerBetrag}}</span>
    </div>
  </div>

  <!-- Payment Terms -->
  <div class="payment-terms">
    <p>Bitte überweisen Sie den offenen Betrag innert 30 Tagen mit beigelegter QR-Rechnung.</p>
    <p>Bei Rückfragen stehen wir Ihnen gerne zur Verfügung.</p>
  </div>

  <!-- Footer with Company Details -->
  <div class="footer">
    <div class="footer-section">
      <strong>{{firmenname}}</strong><br>
      {{strasse}} {{hausnummer}}<br>
      {{plz}} {{ort}}
    </div>
    <div class="footer-section">
      {{email}}<br>
      {{website}}
    </div>
    <div class="footer-section">
      {{ort}}, {{land}}<br>
      IBAN: {{iban}}<br>
      Swift-BIC: {{swift}}
    </div>
  </div>
</div>
  `,

  css: `
/* Page Setup */
@page {
  size: A4;
  margin: 0;
}

body {
  margin: 0;
  padding: 0;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11pt;
  color: #000;
  line-height: 1.4;
}

.invoice-page {
  width: 210mm;
  min-height: 297mm;
  padding: 25mm 20mm;
  box-sizing: border-box;
  background: white;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
}

.logo-section img {
  max-width: 200px;
  max-height: 80px;
  object-fit: contain;
}

.company-info {
  text-align: right;
  font-size: 10pt;
}

.company-name {
  font-weight: bold;
  font-size: 14pt;
  margin-bottom: 4px;
}

.contact-person {
  font-weight: 600;
  margin-bottom: 2px;
}

/* Recipient */
.recipient {
  margin-bottom: 30px;
}

.recipient-label {
  font-weight: 600;
  margin-bottom: 8px;
}

.recipient-company {
  font-weight: bold;
}

/* Invoice Details */
.invoice-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-bottom: 40px;
  gap: 4px;
}

.detail-row {
  display: flex;
  gap: 40px;
  align-items: center;
}

.detail-row .label {
  font-weight: 600;
  min-width: 150px;
  text-align: left;
}

.detail-row .value {
  min-width: 120px;
  text-align: left;
}

/* Invoice Title */
.invoice-title {
  font-size: 20pt;
  font-weight: bold;
  margin: 30px 0 16px 0;
  color: #000;
}

.divider {
  border-bottom: 1px solid #d1d5db;
  margin: 16px 0;
}

/* Positions Table */
.positions-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.positions-table thead tr {
  background-color: #f3f4f6;
}

.positions-table th {
  padding: 12px 16px;
  font-weight: 600;
  color: #374151;
  border: none;
}

.positions-table th.col-description {
  text-align: left;
}

.positions-table th.col-quantity {
  text-align: center;
  width: 80px;
}

.positions-table th.col-price,
.positions-table th.col-total {
  text-align: right;
  width: 120px;
}

.positions-table tbody tr:nth-child(even) {
  background-color: #f9fafb;
}

.positions-table tbody tr:nth-child(odd) {
  background-color: #ffffff;
}

.positions-table td {
  padding: 12px 16px;
  color: #1f2937;
  border: none;
}

.positions-table td.col-description {
  text-align: left;
}

.positions-table td.col-quantity {
  text-align: center;
}

.positions-table td.col-price,
.positions-table td.col-total {
  text-align: right;
}

.positions-table td.col-total {
  font-weight: 500;
}

/* Totals Section */
.totals-section {
  display: flex;
  justify-content: flex-end;
  margin: 20px 0;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  min-width: 350px;
}

.total-row.subtotal {
  font-weight: 500;
}

.total-row.final-total {
  border-top: 1px solid #d1d5db;
  padding-top: 12px;
  margin-top: 8px;
  font-weight: bold;
  font-size: 14pt;
}

/* Payment Terms */
.payment-terms {
  margin: 40px 0;
  font-size: 10pt;
  line-height: 1.6;
}

/* Footer */
.footer {
  display: flex;
  justify-content: space-between;
  margin-top: 60px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  font-size: 9pt;
  line-height: 1.5;
}

.footer-section {
  flex: 1;
}

/* Print Styles */
@media print {
  .invoice-page {
    page-break-after: always;
  }

  .positions-table {
    page-break-inside: avoid;
  }
}
  `,
};

export default professionalInvoiceTemplate;
