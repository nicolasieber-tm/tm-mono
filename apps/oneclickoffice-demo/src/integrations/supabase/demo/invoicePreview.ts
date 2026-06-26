/* eslint-disable @typescript-eslint/no-explicit-any */
// Demo-Handler für die Edge-Function `generate-invoice-pdf`.
// Der Haupt-Rechnungsflow (Rechnungen.tsx) verzweigt im Demo bereits VOR diesem Aufruf
// und erzeugt eine HTML-Vorschau. Dieser Stub ist nur ein sicherer Fallback für andere
// Aufrufpfade (z. B. HtmlInvoiceGenerator), damit nichts crasht — ohne echten Export.

import { setDemoFunctionHandler } from "./functions";

setDemoFunctionHandler("generate-invoice-pdf", async () => {
  const html =
    "<html><body style=\"font-family:Inter,system-ui,sans-serif;padding:48px;color:#21242C\">" +
    "<h1 style=\"color:#3B82F6\">Demo-Rechnung</h1>" +
    "<p>Diese Rechnung ist eine Vorschau im Demo-Modus und nicht gültig.</p></body></html>";
  return { data: { success: true, html, pages: [html] }, error: null };
});
