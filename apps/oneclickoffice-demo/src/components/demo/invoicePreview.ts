/* eslint-disable @typescript-eslint/no-explicit-any */
// Erzeugt im Demo-Modus eine HTML-Rechnungs-VORSCHAU (kein echtes PDF, kein Export).
// Wird als Blob-URL geliefert und über „Vorschau" in einem neuen Tab geöffnet.
// Trägt ein deutliches „DEMO – UNGÜLTIG"-Wasserzeichen, damit nichts missbraucht werden kann.

type Position = {
  beschreibung?: string;
  datum?: string;
  menge?: string;
  preis?: string;
  total?: string;
};

export type DemoInvoicePreviewInput = {
  invoiceNumber: string;
  sender: { name: string; address: string; zip: string; city: string; iban: string };
  recipient: { company: string; person: string; address: string; zip: string; city: string };
  positionen: Position[];
  subtotalLabel: string;
  vatLabel: string;
  totalLabel: string;
  qrCodeDataUrl?: string;
  dateLabel: string;
};

function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildDemoInvoiceHtml(d: DemoInvoicePreviewInput): string {
  const rows = (d.positionen ?? [])
    .map(
      (p) => `
      <tr>
        <td>${esc(p.datum)}</td>
        <td>${esc(p.beschreibung)}</td>
        <td class="num">${esc(p.menge)}</td>
        <td class="num">${esc(p.preis)}</td>
        <td class="num">${esc(p.total)}</td>
      </tr>`
    )
    .join("");

  const qrBlock = d.qrCodeDataUrl
    ? `<div class="qr">
         <img src="${esc(d.qrCodeDataUrl)}" alt="Swiss QR" />
         <div class="qrnote">Swiss QR-Rechnung · <strong>Demo, nicht zahlbar</strong></div>
       </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<title>Vorschau Rechnung ${esc(d.invoiceNumber)} (Demo)</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #EDEFF3; font-family: 'Inter', system-ui, sans-serif; color: #21242C; padding: 32px 16px; }
  .sheet {
    position: relative; width: 794px; min-height: 1123px; margin: 0 auto; background: #fff;
    border: 1px solid #E4E6EA; border-radius: 14px; box-shadow: 0 10px 30px rgba(20,24,44,.10);
    padding: 64px 64px 48px; overflow: hidden;
  }
  .watermark {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    pointer-events: none; z-index: 5;
  }
  .watermark span {
    transform: rotate(-28deg); font-size: 84px; font-weight: 700; letter-spacing: .04em;
    color: rgba(59,130,246,.10); border: 6px solid rgba(59,130,246,.14); padding: 18px 46px; border-radius: 18px;
    white-space: nowrap;
  }
  .content { position: relative; z-index: 6; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 56px; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .mark { width: 44px; height: 44px; border-radius: 12px; background: #3B82F6; display: flex; align-items: center; justify-content: center; }
  .mark::after { content: ""; width: 18px; height: 18px; border: 3px solid #fff; border-right-color: rgba(255,255,255,.45); border-radius: 50%; }
  .brand h1 { font-size: 20px; font-weight: 700; letter-spacing: -.02em; }
  .sender { font-size: 13px; color: #5C636E; line-height: 1.5; text-align: right; }
  .meta { text-align: right; }
  .meta .chip { display: inline-block; font-size: 12px; font-weight: 600; color: #3B82F6; background: #EFF6FF; padding: 6px 12px; border-radius: 9999px; margin-bottom: 10px; }
  .meta h2 { font-size: 28px; font-weight: 700; letter-spacing: -.02em; }
  .meta .date { font-size: 13px; color: #5C636E; margin-top: 4px; }
  .recipient { margin: 8px 0 40px; font-size: 14px; line-height: 1.6; }
  .recipient .lbl { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: #5C636E; margin-bottom: 6px; }
  .recipient strong { font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
  thead th { text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; color: #5C636E; padding: 12px 10px; border-bottom: 2px solid #E4E6EA; }
  tbody td { font-size: 14px; padding: 12px 10px; border-bottom: 1px solid #EFF0F3; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .totals { margin-left: auto; width: 320px; }
  .totals .row { display: flex; justify-content: space-between; padding: 8px 10px; font-size: 14px; }
  .totals .grand { border-top: 2px solid #E4E6EA; margin-top: 6px; font-size: 18px; font-weight: 700; color: #3B82F6; }
  .qr { margin-top: 48px; padding-top: 28px; border-top: 1px dashed #E4E6EA; display: flex; align-items: center; gap: 20px; }
  .qr img { width: 150px; height: 150px; }
  .qrnote { font-size: 13px; color: #5C636E; }
  .footer { margin-top: 40px; font-size: 11px; color: #98A0AC; text-align: center; }
  .demobar { position: sticky; top: 0; z-index: 20; background: #3B82F6; color: #fff; text-align: center; font-size: 13px; font-weight: 600; padding: 10px; border-radius: 9999px; max-width: 794px; margin: 0 auto 18px; }
</style>
</head>
<body>
  <div class="demobar">Demo-Vorschau · Diese Rechnung ist nicht gültig und kann nicht exportiert werden</div>
  <div class="sheet">
    <div class="watermark"><span>DEMO · UNGÜLTIG</span></div>
    <div class="content">
      <div class="top">
        <div class="brand">
          <div class="mark"></div>
          <div><h1>${esc(d.sender.name)}</h1></div>
        </div>
        <div>
          <div class="meta">
            <div class="chip">Rechnung</div>
            <h2>${esc(d.invoiceNumber)}</h2>
            <div class="date">${esc(d.dateLabel)}</div>
          </div>
          <div class="sender">
            ${esc(d.sender.address)}<br/>${esc(d.sender.zip)} ${esc(d.sender.city)}<br/>${esc(d.sender.iban)}
          </div>
        </div>
      </div>

      <div class="recipient">
        <div class="lbl">Rechnung an</div>
        <strong>${esc(d.recipient.company)}</strong><br/>
        ${d.recipient.person ? esc(d.recipient.person) + "<br/>" : ""}
        ${esc(d.recipient.address)}<br/>${esc(d.recipient.zip)} ${esc(d.recipient.city)}
      </div>

      <table>
        <thead>
          <tr><th>Datum</th><th>Leistung</th><th class="num">Std.</th><th class="num">Ansatz</th><th class="num">Betrag</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="totals">
        <div class="row"><span>Zwischensumme</span><span>${esc(d.subtotalLabel)}</span></div>
        <div class="row"><span>MwSt.</span><span>${esc(d.vatLabel)}</span></div>
        <div class="row grand"><span>Total</span><span>${esc(d.totalLabel)}</span></div>
      </div>

      ${qrBlock}

      <div class="footer">Erstellt mit OneClick Office · Demo-Modus — kein gültiger Zahlungsbeleg</div>
    </div>
  </div>
</body>
</html>`;
}

/** Baut die Vorschau und gibt eine Blob-URL zurück (im neuen Tab öffenbar). */
export function createDemoInvoicePreviewUrl(input: DemoInvoicePreviewInput): string {
  const html = buildDemoInvoiceHtml(input);
  const blob = new Blob([html], { type: "text/html" });
  return URL.createObjectURL(blob);
}
