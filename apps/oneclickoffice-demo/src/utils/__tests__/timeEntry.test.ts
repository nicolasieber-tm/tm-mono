import { describe, it, expect } from "vitest";
import {
  formatEndTimeFromDuration,
  isMonthlyCategory,
  deriveTimeEntryFields,
} from "@/utils/timeEntry";

describe("formatEndTimeFromDuration", () => {
  it("formatiert ganze Stunden", () => {
    expect(formatEndTimeFromDuration(2)).toBe("02:00");
  });
  it("formatiert Bruchteile", () => {
    expect(formatEndTimeFromDuration(1.5)).toBe("01:30");
  });
  it("klemmt auf 23:59", () => {
    expect(formatEndTimeFromDuration(30)).toBe("23:59");
  });
  it("nutzt mindestens 1 Minute bei 0", () => {
    expect(formatEndTimeFromDuration(0)).toBe("00:01");
  });
});

describe("isMonthlyCategory", () => {
  it("erkennt die Monats-Kategorie case-insensitiv", () => {
    expect(isMonthlyCategory("Kurzkontakte ganzer Monat")).toBe(true);
  });
  it("liefert false für andere Kategorien", () => {
    expect(isMonthlyCategory("Beratung")).toBe(false);
  });
  it("verträgt null/undefined", () => {
    expect(isMonthlyCategory(null)).toBe(false);
    expect(isMonthlyCategory(undefined)).toBe(false);
  });
});

describe("deriveTimeEntryFields", () => {
  it("leitet Start/Ende ab und behält das Datum für normale Kategorien", () => {
    expect(
      deriveTimeEntryFields({ date: "2026-06-25", totalHours: 1.5, category: "Beratung" })
    ).toEqual({ date: "2026-06-25", start_time: "00:00", end_time: "01:30", total_hours: 1.5 });
  });
  it("normalisiert das Datum auf den Monatsersten bei Monats-Kategorie", () => {
    expect(
      deriveTimeEntryFields({ date: "2026-06-25", totalHours: 2, category: "Kurzkontakte ganzer Monat" })
    ).toEqual({ date: "2026-06-01", start_time: "00:00", end_time: "02:00", total_hours: 2 });
  });
});
