import { describe, it, expect } from "vitest";
import {
  toMovements,
  filterMovements,
  type ExportInvoice,
  type ExportExpense,
  type NameLookups,
} from "../financeExport";

const lookups: NameLookups = {
  clientNames: new Map([["c1", "Anna Muster"]]),
  companyNames: new Map([["k1", "Acme AG"]]),
};

const invoices: ExportInvoice[] = [
  {
    id: "i1",
    invoice_number: "2026-001",
    total: 100,
    status: "paid",
    period_end: "2026-03-10",
    client_id: "c1",
    company_id: "k1",
  },
  {
    id: "i2",
    invoice_number: "2026-002",
    total: 50,
    status: "sent",
    period_end: "2026-04-01",
    client_id: null,
    company_id: "k1",
  },
];

const expenses: ExportExpense[] = [
  {
    id: "e1",
    amount: 30,
    status: "completed",
    expense_date: "2026-03-15",
    category: "Reise",
    notes: "Zugticket",
    client_id: "c1",
    company_id: null,
  },
  {
    id: "e2",
    amount: 999,
    status: "processing",
    expense_date: "2026-03-20",
    category: "Material",
    notes: null,
    client_id: null,
    company_id: null,
  },
  {
    id: "e3f",
    amount: 555,
    status: "failed",
    expense_date: "2026-03-25",
    category: "Material",
    notes: null,
    client_id: null,
    company_id: null,
  },
];

describe("toMovements", () => {
  it("normalisiert Rechnungen als Einnahmen mit aufgelösten Namen", () => {
    const m = toMovements(invoices, [], lookups);
    expect(m).toHaveLength(2);
    const first = m.find((x) => x.id === "i1")!;
    expect(first.type).toBe("income");
    expect(first.date).toBe("2026-03-10");
    expect(first.description).toBe("Rechnung 2026-001");
    expect(first.clientName).toBe("Anna Muster");
    expect(first.companyName).toBe("Acme AG");
    expect(first.amount).toBe(100);
    expect(first.statusLabel).toBe("Bezahlt");
  });

  it("normalisiert finalisierte Spesen als Ausgaben", () => {
    const m = toMovements([], expenses, lookups);
    expect(m).toHaveLength(1); // 'processing' und 'failed' ausgeschlossen
    expect(m[0].id).toBe("e1");
    expect(m[0].type).toBe("expense");
    expect(m[0].description).toBe("Zugticket");
    expect(m[0].category).toBe("Reise");
    expect(m[0].amount).toBe(30);
    expect(m.find((x) => x.id === "e2")).toBeUndefined(); // 'processing' ausgeschlossen
    expect(m.find((x) => x.id === "e3f")).toBeUndefined(); // 'failed' ausgeschlossen
  });

  it("nutzt Kategorie als Beschreibung, wenn keine Notiz vorhanden", () => {
    const noNote: ExportExpense = { ...expenses[0], id: "e3", notes: null };
    const m = toMovements([], [noNote], lookups);
    expect(m[0].description).toBe("Reise");
  });

  it("liefert leeren Namen bei unbekannter/fehlender Zuordnung", () => {
    const m = toMovements(invoices, [], lookups);
    const second = m.find((x) => x.id === "i2")!;
    expect(second.clientName).toBe("");
    expect(second.companyName).toBe("Acme AG");
  });
});

describe("filterMovements", () => {
  const all = toMovements(invoices, expenses, lookups);
  const base = {
    range: { from: null, to: null },
    clientId: null,
    companyId: null,
    type: "all" as const,
    status: "all" as const,
  };

  it("filtert nach Zeitraum (inklusive Grenzen)", () => {
    const r = filterMovements(all, {
      ...base,
      range: { from: "2026-03-01", to: "2026-03-31" },
    });
    expect(r.map((m) => m.id).sort()).toEqual(["e1", "i1"]);
  });

  it("filtert nach Klient", () => {
    const r = filterMovements(all, { ...base, clientId: "c1" });
    expect(r.map((m) => m.id).sort()).toEqual(["e1", "i1"]);
  });

  it("filtert nach Kunde", () => {
    const r = filterMovements(all, { ...base, companyId: "k1" });
    expect(r.map((m) => m.id).sort()).toEqual(["i1", "i2"]);
  });

  it("filtert nach Typ", () => {
    expect(filterMovements(all, { ...base, type: "income" }).every((m) => m.type === "income")).toBe(true);
    expect(filterMovements(all, { ...base, type: "expense" }).every((m) => m.type === "expense")).toBe(true);
  });

  it("Status-Filter wirkt nur auf Einnahmen", () => {
    const r = filterMovements(all, { ...base, status: "paid" });
    // i2 (sent) raus, i1 (paid) bleibt, e1 (Ausgabe) bleibt unberührt
    expect(r.map((m) => m.id).sort()).toEqual(["e1", "i1"]);
  });

  it("Status=all schliesst Entwuerfe aus (draft wird nie gezaehlt, ausser explizit)", () => {
    const draftInvoice: ExportInvoice = {
      id: "i3d",
      invoice_number: "2026-003",
      total: 70,
      status: "draft",
      period_end: "2026-03-12",
      client_id: "c1",
      company_id: "k1",
    };
    const withDraft = toMovements([...invoices, draftInvoice], expenses, lookups);
    const r = filterMovements(withDraft, { ...base, status: "all" });
    // draft-Rechnung NICHT enthalten
    expect(r.find((m) => m.id === "i3d")).toBeUndefined();
    // paid und sent Einnahmen enthalten
    expect(r.find((m) => m.id === "i1")).toBeDefined();
    expect(r.find((m) => m.id === "i2")).toBeDefined();
    // Ausgaben unberuehrt
    expect(r.find((m) => m.id === "e1")).toBeDefined();
  });

  it("Status=draft zeigt nur Entwuerfe; paid/sent ausgeschlossen; Ausgaben bleiben", () => {
    const draftInvoice: ExportInvoice = {
      id: "i3d",
      invoice_number: "2026-003",
      total: 70,
      status: "draft",
      period_end: "2026-03-12",
      client_id: "c1",
      company_id: "k1",
    };
    const withDraft = toMovements([...invoices, draftInvoice], expenses, lookups);
    const r = filterMovements(withDraft, { ...base, status: "draft" });
    // draft-Rechnung enthalten
    expect(r.find((m) => m.id === "i3d")).toBeDefined();
    // paid und sent Einnahmen NICHT enthalten
    expect(r.find((m) => m.id === "i1")).toBeUndefined();
    expect(r.find((m) => m.id === "i2")).toBeUndefined();
    // Ausgaben unberuehrt (status-Filter beruehrt keine expenses)
    expect(r.find((m) => m.id === "e1")).toBeDefined();
  });
});

import { buildFinanceCSV, exportFilename } from "../financeExport";

describe("buildFinanceCSV", () => {
  const movements = toMovements(invoices, expenses, lookups);

  it("schreibt Header und eine Zeile pro Bewegung", () => {
    const csv = buildFinanceCSV(movements);
    const lines = csv.split("\n");
    expect(lines[0]).toBe(
      "Datum;Typ;Beleg/Beschreibung;Klient;Kunde;Kategorie;Status;Betrag (CHF)",
    );
    // 1 Header + 2 Einnahmen + 1 finalisierte Ausgabe = 4 Datenzeilen
    expect(lines.filter((l) => l.startsWith("2026-")).length).toBe(3);
    expect(csv).toContain("Einnahme");
    expect(csv).toContain("Ausgabe");
  });

  it("maskiert Semikolons in Beschreibungen", () => {
    const tricky = toMovements(
      [],
      [{ ...expenses[0], id: "x", notes: "Hotel; Zürich" }],
      lookups,
    );
    const csv = buildFinanceCSV(tricky);
    expect(csv).toContain('"Hotel; Zürich"');
  });

  it("hängt Summenblock mit Saldo an", () => {
    const csv = buildFinanceCSV(movements);
    expect(csv).toContain("Total Einnahmen;;;;;;;150.00");
    expect(csv).toContain("Total Ausgaben;;;;;;;30.00");
    expect(csv).toContain("Saldo;;;;;;;120.00");
  });
});

describe("exportFilename", () => {
  it("nutzt Von–Bis bei gesetztem Zeitraum", () => {
    const name = exportFilename(
      { range: { from: "2026-01-01", to: "2026-06-24" }, clientId: null, companyId: null, type: "all", status: "all" },
      "2026-06-24",
    );
    expect(name).toBe("Finanzen_2026-01-01_2026-06-24.csv");
  });

  it("fällt bei offenem Zeitraum auf 'Alle' + heutiges Datum zurück", () => {
    const name = exportFilename(
      { range: { from: null, to: null }, clientId: null, companyId: null, type: "all", status: "all" },
      "2026-06-24",
    );
    expect(name).toBe("Finanzen_Alle_2026-06-24.csv");
  });
});
