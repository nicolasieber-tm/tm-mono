import { describe, it, expect } from "vitest";
import {
  computeRange,
  isWithinRange,
  aggregateFinances,
  type FinanceInvoice,
  type FinanceExpense,
} from "@/utils/entityFinances";

describe("computeRange", () => {
  it("returns open range for 'all' and 'custom'", () => {
    expect(computeRange("all", "2026-06-08")).toEqual({ from: null, to: null });
    expect(computeRange("custom", "2026-06-08")).toEqual({ from: null, to: null });
  });

  it("returns a single day for 'today'", () => {
    expect(computeRange("today", "2026-06-08")).toEqual({
      from: "2026-06-08",
      to: "2026-06-08",
    });
  });

  it("returns Monday–Sunday for 'week'", () => {
    // 2026-06-10 is a Wednesday → week is Mon 06-08 .. Sun 06-14
    expect(computeRange("week", "2026-06-10")).toEqual({
      from: "2026-06-08",
      to: "2026-06-14",
    });
    // 2026-02-15 is a Sunday → week is Mon 02-09 .. Sun 02-15
    expect(computeRange("week", "2026-02-15")).toEqual({
      from: "2026-02-09",
      to: "2026-02-15",
    });
  });

  it("returns full month incl. leap years for 'month'", () => {
    expect(computeRange("month", "2026-06-08")).toEqual({
      from: "2026-06-01",
      to: "2026-06-30",
    });
    expect(computeRange("month", "2026-02-15")).toEqual({
      from: "2026-02-01",
      to: "2026-02-28",
    });
    expect(computeRange("month", "2024-02-10")).toEqual({
      from: "2024-02-01",
      to: "2024-02-29",
    });
  });

  it("returns full calendar year for 'year'", () => {
    expect(computeRange("year", "2026-06-08")).toEqual({
      from: "2026-01-01",
      to: "2026-12-31",
    });
  });
});

describe("isWithinRange", () => {
  it("accepts everything when range is open", () => {
    expect(isWithinRange("2020-01-01", { from: null, to: null })).toBe(true);
  });
  it("respects inclusive bounds", () => {
    const r = { from: "2026-06-01", to: "2026-06-30" };
    expect(isWithinRange("2026-06-01", r)).toBe(true);
    expect(isWithinRange("2026-06-30", r)).toBe(true);
    expect(isWithinRange("2026-05-31", r)).toBe(false);
    expect(isWithinRange("2026-07-01", r)).toBe(false);
  });
  it("handles RFC3339 timestamps and empty input", () => {
    expect(isWithinRange("2026-06-15T10:00:00Z", { from: "2026-06-01", to: "2026-06-30" })).toBe(true);
    expect(isWithinRange("", { from: null, to: null })).toBe(false);
  });
  it("supports half-open ranges", () => {
    expect(isWithinRange("2026-07-01", { from: "2026-06-01", to: null })).toBe(true);
    expect(isWithinRange("2026-05-31", { from: "2026-06-01", to: null })).toBe(false);
    expect(isWithinRange("2026-05-31", { from: null, to: "2026-06-30" })).toBe(true);
    expect(isWithinRange("2026-07-01", { from: null, to: "2026-06-30" })).toBe(false);
  });
});

const inv = (over: Partial<FinanceInvoice>): FinanceInvoice => ({
  id: "i", invoice_number: "R-1", total: 100, status: "paid", period_end: "2026-06-10", ...over,
});
const exp = (over: Partial<FinanceExpense>): FinanceExpense => ({
  id: "e", amount: 50, status: "completed", expense_date: "2026-06-10", category: "Fahrt", notes: null, ...over,
});

describe("aggregateFinances", () => {
  it("groups income by paid/sent/draft and sums expenses", () => {
    const invoices = [
      inv({ id: "p1", total: 100, status: "paid" }),
      inv({ id: "p2", total: 200, status: "paid" }),
      inv({ id: "s1", total: 80, status: "sent" }),
      inv({ id: "d1", total: 999, status: "draft" }),
    ];
    const expenses = [
      exp({ id: "x1", amount: 30, status: "completed" }),
      exp({ id: "x2", amount: 20, status: "completed" }),
    ];
    const r = aggregateFinances(invoices, expenses, { from: null, to: null });
    expect(r.einnahmenBezahlt).toEqual({ count: 2, sum: 300 });
    expect(r.einnahmenOffen).toEqual({ count: 1, sum: 80 });
    expect(r.entwuerfe).toEqual({ count: 1, sum: 999 });
    expect(r.ausgaben).toEqual({ count: 2, sum: 50 });
    expect(r.einnahmenGesamt).toBe(380);
    expect(r.saldo).toBe(330);
  });

  it("excludes processing/failed expenses from totals", () => {
    const expenses = [
      exp({ id: "ok", amount: 40, status: "completed" }),
      exp({ id: "proc", amount: 1000, status: "processing" }),
      exp({ id: "fail", amount: 1000, status: "failed" }),
    ];
    const r = aggregateFinances([], expenses, { from: null, to: null });
    expect(r.ausgaben).toEqual({ count: 1, sum: 40 });
  });

  it("filters invoices by period_end and expenses by expense_date", () => {
    const invoices = [
      inv({ id: "inJune", total: 100, status: "paid", period_end: "2026-06-15" }),
      inv({ id: "inMay", total: 500, status: "paid", period_end: "2026-05-15" }),
    ];
    const expenses = [
      exp({ id: "eJune", amount: 10, expense_date: "2026-06-20" }),
      exp({ id: "eJuly", amount: 99, expense_date: "2026-07-01" }),
    ];
    const r = aggregateFinances(invoices, expenses, { from: "2026-06-01", to: "2026-06-30" });
    expect(r.einnahmenBezahlt).toEqual({ count: 1, sum: 100 });
    expect(r.ausgaben).toEqual({ count: 1, sum: 10 });
    expect(r.saldo).toBe(90);
  });

  it("builds a combined movement list sorted by date desc, limited", () => {
    const invoices = [
      inv({ id: "i1", invoice_number: "R-9", total: 100, status: "paid", period_end: "2026-06-10" }),
      inv({ id: "draft", total: 7, status: "draft", period_end: "2026-06-30" }),
    ];
    const expenses = [exp({ id: "e1", amount: 50, expense_date: "2026-06-20", category: "Material" })];
    const r = aggregateFinances(invoices, expenses, { from: null, to: null }, 8);
    // draft is excluded from movements; expense (06-20) before income (06-10)
    expect(r.bewegungen.map((m) => m.id)).toEqual(["e1", "i1"]);
    expect(r.bewegungen[0]).toMatchObject({ type: "expense", amount: 50, label: "Material" });
    expect(r.bewegungen[1]).toMatchObject({ type: "income", amount: 100, label: "Rechnung R-9" });
  });

  it("respects the movement limit", () => {
    const expenses = Array.from({ length: 12 }, (_, i) =>
      exp({ id: `e${i}`, expense_date: `2026-06-${String(i + 1).padStart(2, "0")}` })
    );
    const r = aggregateFinances([], expenses, { from: null, to: null }, 8);
    expect(r.bewegungen).toHaveLength(8);
  });
});
