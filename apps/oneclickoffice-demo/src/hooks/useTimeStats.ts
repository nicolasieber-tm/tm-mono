import { useMemo } from "react";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { Database } from "@/integrations/supabase/types";

export type TimeEntryRow = Database["public"]["Tables"]["time_entries"]["Row"] & {
  clients?: { first_name: string; last_name: string } | null;
  kunden?: { name: string } | null;
};

export type DayBucket = { date: string; label: string; hours: number; isToday: boolean };

const WEEKDAY_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

/** Lokales YYYY-MM-DD (kein UTC-Versatz wie bei toISOString). */
const localISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/**
 * Aggregierte Zeitstatistik für Mobile-Dashboard und Profil.
 * Baut ausschliesslich auf dem bestehenden useTimeEntries-Cache auf –
 * kein zusätzlicher Netzwerk-Request.
 */
export const useTimeStats = () => {
  const { data, isLoading } = useTimeEntries();

  return useMemo(() => {
    const entries = (data ?? []) as TimeEntryRow[];
    const now = new Date();
    const todayStr = localISO(now);
    const monthPrefix = todayStr.slice(0, 7);

    const hoursOn = (dateStr: string) =>
      entries
        .filter((e) => e.date === dateStr)
        .reduce((sum, e) => sum + (e.total_hours ?? 0), 0);

    // Letzte 7 Tage (inkl. heute)
    const last7: DayBucket[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const ds = localISO(d);
      last7.push({
        date: ds,
        label: WEEKDAY_SHORT[d.getDay()],
        hours: hoursOn(ds),
        isToday: i === 0,
      });
    }
    const weekHours = last7.reduce((s, d) => s + d.hours, 0);

    // Vorherige 7 Tage (Tag 13..7) für Trend
    let prevWeekHours = 0;
    for (let i = 13; i >= 7; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      prevWeekHours += hoursOn(localISO(d));
    }

    const monthEntries = entries.filter((e) => (e.date ?? "").startsWith(monthPrefix));
    const monthHours = monthEntries.reduce((s, e) => s + (e.total_hours ?? 0), 0);

    const todayEntries = entries.filter((e) => e.date === todayStr);
    const todayTotal = todayEntries.reduce((s, e) => s + (e.total_hours ?? 0), 0);

    return {
      isLoading,
      weekHours,
      prevWeekHours,
      deltaHours: weekHours - prevWeekHours,
      monthHours,
      monthCount: monthEntries.length,
      totalCount: entries.length,
      last7,
      todayEntries,
      todayTotal,
    };
  }, [data, isLoading]);
};
