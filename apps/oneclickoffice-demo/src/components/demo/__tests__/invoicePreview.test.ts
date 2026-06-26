import { describe, it, expect } from "vitest";
import { buildDemoInvoiceHtml } from "../invoicePreview";

describe("Demo-Rechnungsvorschau", () => {
  const html = buildDemoInvoiceHtml({
    invoiceNumber: "RE-202606-099",
    dateLabel: "25.06.2026",
    sender: { name: "Coaching Praxis Demo", address: "Bahnhofstrasse 12", zip: "8001", city: "Zürich", iban: "CH93 0076 2011 6238 5295 7" },
    recipient: { company: "Helvetia Assurances AG", person: "Jonas Brandt", address: "Dufourstrasse 40", zip: "9001", city: "St. Gallen" },
    positionen: [{ beschreibung: "Coaching-Session", datum: "04.06.2026", menge: "1.00", preis: "180.00 CHF", total: "180.00 CHF" }],
    subtotalLabel: "180.00 CHF",
    vatLabel: "0.00 CHF",
    totalLabel: "180.00 CHF",
    qrCodeDataUrl: "data:image/png;base64,AAAABBBB",
  });

  it("trägt das DEMO-Wasserzeichen (nicht missbrauchbar)", () => {
    expect(html).toContain("DEMO");
    expect(html).toMatch(/UNG(Ü|&Uuml;)LTIG|UNGÜLTIG/);
    expect(html).toContain("nicht gültig");
  });

  it("enthält Rechnungsnummer, Empfänger, Position und Total", () => {
    expect(html).toContain("RE-202606-099");
    expect(html).toContain("Helvetia Assurances AG");
    expect(html).toContain("Coaching-Session");
    expect(html).toContain("180.00 CHF");
  });

  it("bettet den QR-Code ein", () => {
    expect(html).toContain("data:image/png;base64,AAAABBBB");
    expect(html).toContain("Demo, nicht zahlbar");
  });

  it("escapet HTML-Sonderzeichen in Eingaben", () => {
    const evil = buildDemoInvoiceHtml({
      invoiceNumber: "<script>x</script>",
      dateLabel: "x",
      sender: { name: "A&B", address: "", zip: "", city: "", iban: "" },
      recipient: { company: "", person: "", address: "", zip: "", city: "" },
      positionen: [],
      subtotalLabel: "", vatLabel: "", totalLabel: "",
    });
    expect(evil).not.toContain("<script>x</script>");
    expect(evil).toContain("&lt;script&gt;");
    expect(evil).toContain("A&amp;B");
  });
});
