/** Kategorien, die als ganzer Monat erfasst werden (Datum → Monatserster). */
export const MONTHLY_CATEGORY_KEYS = new Set<string>(["kurzkontakte ganzer monat"]);

export function isMonthlyCategory(category: string | null | undefined): boolean {
  return MONTHLY_CATEGORY_KEYS.has((category ?? "").trim().toLowerCase());
}

/**
 * Wandelt eine Dauer (Stunden) in eine abgeleitete Endzeit "HH:MM".
 * Start ist immer "00:00"; Ende = Dauer, geklemmt auf 23:59, min. 1 Minute.
 * Spiegelt die Logik aus Zeiterfassung.tsx / mobile/Zeit.tsx.
 */
export function formatEndTimeFromDuration(hours: number): string {
  const totalMinutes = Math.max(1, Math.round(hours * 60));
  const clampedMinutes = Math.min(totalMinutes, 23 * 60 + 59);
  const h = Math.floor(clampedMinutes / 60).toString().padStart(2, "0");
  const m = (clampedMinutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export interface TimeEntrySaveInput {
  date: string; // "YYYY-MM-DD"
  totalHours: number;
  category: string;
}

export interface TimeEntryDerived {
  date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
}

/**
 * Berechnet die abgeleiteten Felder beim Speichern eines Zeiteintrags:
 * - start_time = "00:00", end_time aus Dauer
 * - bei Monats-Kategorie: date → Monatserster ("YYYY-MM-01")
 */
export function deriveTimeEntryFields({ date, totalHours, category }: TimeEntrySaveInput): TimeEntryDerived {
  const hours = Number(totalHours) || 0;
  const normalizedDate = isMonthlyCategory(category) && date ? `${date.slice(0, 7)}-01` : date;
  return {
    date: normalizedDate,
    start_time: "00:00",
    end_time: formatEndTimeFromDuration(hours),
    total_hours: hours,
  };
}
