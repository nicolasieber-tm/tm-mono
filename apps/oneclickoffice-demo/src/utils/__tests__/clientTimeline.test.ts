import { describe, it, expect } from "vitest";
import {
  mapNotes,
  mapInvoices,
  mapTimeEntries,
  mapExpenses,
  mergeTimeline,
  type TimelineEvent,
} from "@/utils/clientTimeline";

describe("mapNotes", () => {
  it("nutzt session_date als Datum, sonst created_at", () => {
    const [withSession, withoutSession] = mapNotes([
      { id: "a", content: "Hallo Welt", session_date: "2026-05-01", created_at: "2026-05-02T10:00:00Z" },
      { id: "b", content: "Nur erstellt", session_date: null, created_at: "2026-04-01T08:00:00Z" },
    ]);
    expect(withSession).toMatchObject({ id: "note:a", type: "note", date: "2026-05-01", title: "Sitzungsnotiz" });
    expect(withoutSession.date).toBe("2026-04-01T08:00:00Z");
  });

  it("kürzt langen Inhalt einzeilig auf max 120 Zeichen mit Ellipse", () => {
    const long = "x".repeat(200);
    const [ev] = mapNotes([{ id: "a", content: `Zeile1\nZeile2 ${long}`, session_date: "2026-01-01", created_at: "2026-01-01T00:00:00Z" }]);
    expect(ev.subtitle).toMatch(/…$/);
    expect(ev.subtitle!.length).toBe(121); // 120 + Ellipse
    expect(ev.subtitle).not.toContain("\n");
  });
});

describe("mapInvoices", () => {
  it("nutzt created_at als Datum und formatiert den Zeitraum", () => {
    const [ev] = mapInvoices([
      { id: "i1", invoice_number: "2026-014", total: 1200.5, status: "sent", created_at: "2026-06-10T12:00:00Z", period_start: "2026-05-01", period_end: "2026-05-31" },
    ]);
    expect(ev).toMatchObject({ id: "invoice:i1", type: "invoice", date: "2026-06-10T12:00:00Z", title: "Rechnung 2026-014", amount: 1200.5, status: "sent" });
    expect(ev.subtitle).toBe("Zeitraum 01.05.2026 – 31.05.2026");
  });
});

describe("mapTimeEntries", () => {
  it("baut Titel mit Stunden und nutzt Beschreibung, sonst Kategorie als Subtitle", () => {
    const [a, b] = mapTimeEntries([
      { id: "t1", date: "2026-03-03", total_hours: 1.5, activity_description: "Beratung", category: "Sitzung" },
      { id: "t2", date: "2026-03-04", total_hours: 2, activity_description: null, category: "Admin" },
    ]);
    expect(a).toMatchObject({ id: "time:t1", type: "time", date: "2026-03-03", title: "Zeiterfassung 1.5 Std.", subtitle: "Beratung" });
    expect(b.subtitle).toBe("Admin");
  });
});

describe("mapExpenses", () => {
  it("nutzt expense_date, Kategorie im Titel und Betrag/Status", () => {
    const [withCat, noCat] = mapExpenses([
      { id: "e1", amount: 42, status: "completed", expense_date: "2026-02-02", category: "Reise", notes: "Zug" },
      { id: "e2", amount: 10, status: "completed", expense_date: "2026-02-03", category: null, notes: null },
    ]);
    expect(withCat).toMatchObject({ id: "expense:e1", type: "expense", date: "2026-02-02", title: "Spese Reise", subtitle: "Zug", amount: 42, status: "completed" });
    expect(noCat.title).toBe("Spese");
    expect(noCat.subtitle).toBeUndefined();
  });
});

describe("mergeTimeline", () => {
  it("sortiert absteigend nach Datum", () => {
    const events: TimelineEvent[] = [
      { id: "note:a", type: "note", date: "2026-01-01", title: "A" },
      { id: "invoice:b", type: "invoice", date: "2026-03-01", title: "B" },
      { id: "time:c", type: "time", date: "2026-02-01", title: "C" },
    ];
    expect(mergeTimeline(events).map((e) => e.id)).toEqual(["invoice:b", "time:c", "note:a"]);
  });

  it("bricht Gleichstand stabil über Typ-Priorität (note<time<invoice<expense)", () => {
    const events: TimelineEvent[] = [
      { id: "expense:x", type: "expense", date: "2026-05-05", title: "X" },
      { id: "note:y", type: "note", date: "2026-05-05", title: "Y" },
      { id: "invoice:z", type: "invoice", date: "2026-05-05", title: "Z" },
    ];
    expect(mergeTimeline(events).map((e) => e.type)).toEqual(["note", "invoice", "expense"]);
  });
});
