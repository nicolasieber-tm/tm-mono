import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Camera, ArrowUpRight, ArrowDownRight, ChevronRight, CalendarClock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTimeStats } from "@/hooks/useTimeStats";
import { useExpenses } from "@/hooks/useExpenses";
import TimeEntryListItem from "@/components/mobile/TimeEntryListItem";
import ExpenseListItem, { ExpenseRow } from "@/components/mobile/ExpenseListItem";
import MobileTimeEntrySheet from "@/components/mobile/MobileTimeEntrySheet";
import MobileExpenseSheet from "@/components/mobile/MobileExpenseSheet";
import { TimeEntryRow } from "@/hooks/useTimeStats";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return "Guten Morgen";
  if (h < 17) return "Guten Tag";
  return "Guten Abend";
};

const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";

const MobileDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const stats = useTimeStats();
  const { data: expenses } = useExpenses();

  const [selectedTime, setSelectedTime] = useState<TimeEntryRow | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRow | null>(null);

  const { data: employee } = useQuery({
    queryKey: ["employee-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("first_name, last_name")
        .eq("id", user!.id)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  const fullName = employee ? `${employee.first_name} ${employee.last_name}` : (user?.email ?? "");
  const firstName = employee?.first_name ?? "";

  const recentExpenses = ((expenses ?? []) as ExpenseRow[]).slice(0, 3);
  const maxHours = Math.max(...stats.last7.map((d) => d.hours), 1);
  const delta = stats.deltaHours;

  const dateLabel = new Intl.DateTimeFormat("de-CH", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="min-h-screen bg-background p-5 space-y-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary capitalize">{dateLabel}</p>
          <h1 className="text-3xl font-bold text-foreground truncate">
            {greeting()}{firstName ? `, ${firstName}` : ""}
          </h1>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg flex-none">
          {initials(fullName)}
        </div>
      </div>

      {/* Wochen-Hero */}
      <div data-tour="dashboard-week" className="rounded-3xl p-5 text-white shadow-lg bg-gradient-to-br from-primary to-blue-600">
        <p className="text-sm font-medium opacity-85">Erfasst · letzte 7 Tage</p>
        <div className="flex items-baseline gap-2 mt-1 mb-2">
          <span className="text-4xl font-bold tabular-nums">{stats.weekHours.toFixed(1)}</span>
          <span className="text-base opacity-90">Std</span>
        </div>
        {stats.prevWeekHours > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full">
            {delta >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {delta >= 0 ? "+" : ""}{delta.toFixed(1)} Std vs. Vorwoche
          </span>
        )}

        <div className="flex items-end gap-1.5 h-16 mt-5">
          {stats.last7.map((d) => (
            <div
              key={d.date}
              className={`flex-1 rounded-md ${d.isToday ? "bg-white" : "bg-white/30"}`}
              style={{ height: `${Math.max((d.hours / maxHours) * 100, 5)}%` }}
              title={`${d.hours.toFixed(2)} h`}
            />
          ))}
        </div>
        <div className="flex gap-1.5 mt-1.5">
          {stats.last7.map((d) => (
            <span key={d.date} className={`flex-1 text-center text-[10px] font-semibold ${d.isToday ? "opacity-100" : "opacity-70"}`}>
              {d.isToday ? "Heute" : d.label}
            </span>
          ))}
        </div>
      </div>

      {/* Schnellaktionen */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate("/mobile/zeit")}
          className="rounded-2xl border border-border bg-card p-4 text-left shadow-sm active:scale-95 transition-transform hover:border-primary"
        >
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2.5">
            <Clock className="h-5 w-5" />
          </div>
          <div className="font-bold text-foreground">Zeit erfassen</div>
          <div className="text-xs text-muted-foreground">Timer oder manuell</div>
        </button>
        <button
          onClick={() => navigate("/mobile/spesen")}
          className="rounded-2xl border border-border bg-card p-4 text-left shadow-sm active:scale-95 transition-transform hover:border-primary"
        >
          <div className="h-10 w-10 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center mb-2.5">
            <Camera className="h-5 w-5" />
          </div>
          <div className="font-bold text-foreground">Beleg scannen</div>
          <div className="text-xs text-muted-foreground">Foto → automatisch</div>
        </button>
      </div>

      {/* Heute erfasst */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-lg font-bold text-foreground">Heute erfasst</h2>
          <span className="text-sm text-muted-foreground">
            {stats.todayEntries.length} {stats.todayEntries.length === 1 ? "Eintrag" : "Einträge"}
          </span>
        </div>
        {stats.todayEntries.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {stats.todayEntries.map((entry) => (
                <TimeEntryListItem key={entry.id} entry={entry} onClick={() => setSelectedTime(entry)} />
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-t border-border">
              <span className="font-semibold text-foreground">Heute gesamt</span>
              <span className="text-lg font-bold text-primary tabular-nums">{stats.todayTotal.toFixed(2)} h</span>
            </div>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <CalendarClock className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Heute noch nichts erfasst.</p>
              <button onClick={() => navigate("/mobile/zeit")} className="text-sm font-semibold text-primary mt-2">
                Jetzt Zeit erfassen →
              </button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Letzte Spesen */}
      {recentExpenses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-bold text-foreground">Letzte Spesen</h2>
            <button onClick={() => navigate("/mobile/spesen")} className="text-sm font-semibold text-primary inline-flex items-center">
              Alle <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {recentExpenses.map((exp) => (
                <ExpenseListItem
                  key={exp.id}
                  expense={exp}
                  onClick={exp.status === "completed" ? () => setSelectedExpense(exp) : undefined}
                />
              ))}
            </div>
          </Card>
        </div>
      )}

      <MobileTimeEntrySheet entry={selectedTime} onOpenChange={(o) => !o && setSelectedTime(null)} />
      <MobileExpenseSheet expense={selectedExpense} onOpenChange={(o) => !o && setSelectedExpense(null)} />
    </div>
  );
};

export default MobileDashboard;
