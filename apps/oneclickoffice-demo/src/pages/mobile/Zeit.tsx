import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useTimeEntries, useCreateTimeEntry } from "@/hooks/useTimeEntries";
import { useKunden } from "@/hooks/useKunden";
import { useClients } from "@/hooks/useClients";
import { useTimeEntryCategories } from "@/hooks/useTimeEntryCategories";
import { useCreateClientNote } from "@/hooks/useClientNotes";
import { useIsSingleLevel } from "@/hooks/useClientHierarchyMode";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Clock, Play, Square, Plus, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import TimeEntryListItem from "@/components/mobile/TimeEntryListItem";
import MobileTimeEntrySheet from "@/components/mobile/MobileTimeEntrySheet";
import { TimeEntryRow } from "@/hooks/useTimeStats";

const inputFieldBase =
  "w-full h-[64px] text-lg font-semibold tracking-wide rounded-[28px] border border-border/60 bg-white shadow-sm transition-[border,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/70 placeholder:text-muted-foreground/70 appearance-none";

const textAreaBase =
  "w-full text-lg rounded-[32px] border border-border/60 bg-white shadow-sm transition-[border,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/70 placeholder:text-muted-foreground/70 resize-none min-h-[130px] leading-relaxed px-5 py-4";

const localISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const Zeit = () => {
  const { user } = useAuth();
  const isSingle = useIsSingleLevel();
  const { data: timeEntries, isLoading } = useTimeEntries();
  const { data: companies } = useKunden();
  const { data: clients } = useClients();
  const { data: categories } = useTimeEntryCategories();
  const createEntry = useCreateTimeEntry();
  const createClientNote = useCreateClientNote();

  const todayISO = localISO(new Date());
  const yesterdayISO = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return localISO(d);
  })();

  const [formData, setFormData] = useState({
    company_id: "",
    client_id: "",
    date: todayISO,
    activity_description: "",
    category: "",
  });
  const [dateMode, setDateMode] = useState<"today" | "yesterday" | "custom">("today");
  // Demo: Detail-Bereich (u.a. Sitzungsnotiz-Feld #session-note) standardmäßig offen,
  // damit der Tour-Step 3 das Feld im DOM findet und die Form vollständig sichtbar ist.
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntryRow | null>(null);

  const monthlyCategoryKeys = new Set(["kurzkontakte ganzer monat"]);
  const isMonthlyCategory = monthlyCategoryKeys.has(formData.category.trim().toLowerCase());
  const getMonthValue = (dateValue: string) => (dateValue ? dateValue.slice(0, 7) : "");

  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [sessionNote, setSessionNote] = useState("");

  // Timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  const hms = (s: number) =>
    [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60]
      .map((x) => String(x).padStart(2, "0"))
      .join(":");

  const toggleTimer = () => {
    if (timerRunning) {
      // Stoppen → Dauer übernehmen
      setTimerRunning(false);
      const mins = Math.max(1, Math.round(timerSeconds / 60));
      setDurationHours(Math.floor(mins / 60));
      setDurationMinutes(mins % 60);
      toast.success(`Dauer übernommen: ${Math.floor(mins / 60)}h ${mins % 60}min`);
      setTimerSeconds(0);
    } else {
      setTimerSeconds(0);
      setTimerRunning(true);
      toast.info("Timer läuft …");
    }
  };

  const filteredClients = clients?.filter((client) => client.company_id === formData.company_id) || [];
  const totalHours = Number((durationHours + durationMinutes / 60).toFixed(2));

  const setDurationFromHours = (h: number) => {
    const clamped = Math.min(23.99, Math.max(0, h));
    setDurationHours(Math.floor(clamped));
    setDurationMinutes(Math.round((clamped - Math.floor(clamped)) * 60));
  };

  const durationClock = `${durationHours.toString().padStart(2, "0")}:${durationMinutes.toString().padStart(2, "0")}`;

  const formatEndTimeFromDuration = (hours: number) => {
    const totalMinutes = Math.max(1, Math.round(hours * 60));
    const clampedMinutes = Math.min(totalMinutes, 23 * 60 + 59);
    const h = Math.floor(clampedMinutes / 60).toString().padStart(2, "0");
    const m = (clampedMinutes % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const todayEntries = ((timeEntries ?? []) as TimeEntryRow[]).filter((entry) => entry.date === todayISO);

  const handleDurationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      setDurationHours(h);
      setDurationMinutes(m);
    }
  };

  const handleDateChip = (mode: "today" | "yesterday" | "custom") => {
    setDateMode(mode);
    if (mode === "today") setFormData((f) => ({ ...f, date: todayISO }));
    else if (mode === "yesterday") setFormData((f) => ({ ...f, date: yesterdayISO }));
  };

  const handleSubmit = async () => {
    const missingFields: string[] = [];
    if (!formData.company_id) missingFields.push("Firma");
    if (!isSingle && !formData.client_id) missingFields.push("Klient");
    if (!formData.date) missingFields.push(isMonthlyCategory ? "Monat" : "Datum");

    if (missingFields.length > 0) {
      toast.error(`Bitte ausfüllen: ${missingFields.join(", ")}`);
      return;
    }
    if (totalHours <= 0) {
      toast.error("Bitte eine Dauer auswählen");
      return;
    }

    const hours = totalHours;
    const derivedStartTime = "00:00";
    const derivedEndTime = formatEndTimeFromDuration(hours);
    const entryDate = isMonthlyCategory && formData.date ? `${formData.date.slice(0, 7)}-01` : formData.date;

    try {
      await createEntry.mutateAsync({
        company_id: formData.company_id,
        client_id: isSingle ? null : formData.client_id,
        employee_id: user?.id || "",
        date: entryDate,
        start_time: derivedStartTime,
        end_time: derivedEndTime,
        total_hours: hours,
        activity_description: formData.activity_description || null,
        category: formData.category || null,
      });
    } catch {
      toast.error("Fehler beim Speichern");
      return;
    }

    toast.success("Zeiteintrag erfolgreich gespeichert");

    const trimmedNote = sessionNote.trim();
    if (trimmedNote !== "") {
      try {
        await createClientNote.mutateAsync(
          isSingle
            ? { companyId: formData.company_id, clientId: null, content: trimmedNote, sessionDate: entryDate }
            : { clientId: formData.client_id, companyId: null, content: trimmedNote, sessionDate: entryDate }
        );
      } catch {
        return;
      }
      setSessionNote("");
    }

    setFormData({ company_id: "", client_id: "", date: todayISO, activity_description: "", category: "" });
    setDateMode("today");
    setDurationHours(0);
    setDurationMinutes(0);
    setDetailsOpen(false);
  };

  const isSubmitting = createEntry.isPending || createClientNote.isPending;
  const noteDisabled = (isSingle ? !formData.company_id : !formData.client_id) || isSubmitting;

  return (
    <div className="min-h-screen bg-background p-5 space-y-6 pb-44">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-foreground mb-1">Zeit erfassen</h1>
        <p className="text-base text-muted-foreground">Erfassen Sie Ihre Arbeitszeit</p>
      </div>

      {/* Timer */}
      <Card className="shadow-md border-0 rounded-[28px] overflow-hidden">
        <CardContent
          className={cn(
            "flex items-center gap-4 p-5 transition-colors",
            timerRunning && "bg-primary/5"
          )}
        >
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full flex-none",
              timerRunning ? "bg-green-500 animate-pulse" : "bg-muted-foreground/30"
            )}
          />
          <div className="flex-1 text-2xl font-bold tabular-nums text-foreground">{hms(timerSeconds)}</div>
          <Button
            type="button"
            onClick={toggleTimer}
            variant={timerRunning ? "destructive" : "secondary"}
            className="h-12 px-5 font-semibold"
          >
            {timerRunning ? (
              <><Square className="h-5 w-5 mr-2" />Stoppen</>
            ) : (
              <><Play className="h-5 w-5 mr-2" />Timer</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Kernfelder */}
      <Card data-tour="zeit-form" className="shadow-md border-0 rounded-[32px]">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Neue Zeiterfassung</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-8">
          {/* Firma + Klient */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-base font-semibold">
                Firma <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.company_id}
                onValueChange={(value) => setFormData({ ...formData, company_id: value, client_id: "" })}
              >
                <SelectTrigger id="company" className={cn(inputFieldBase, "px-5 text-left font-semibold")}>
                  <SelectValue placeholder="Firma wählen" />
                </SelectTrigger>
                <SelectContent>
                  {companies?.map((company) => (
                    <SelectItem key={company.id} value={company.id} className="text-lg py-3">
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isSingle && (
              <div className="space-y-2">
                <Label htmlFor="client" className="text-base font-semibold">
                  Klient <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                  disabled={!formData.company_id}
                >
                  <SelectTrigger
                    id="client"
                    className={cn(inputFieldBase, "px-5 text-left font-semibold", !formData.company_id && "opacity-70")}
                  >
                    <SelectValue placeholder={formData.company_id ? "Klient wählen" : "Zuerst Firma wählen"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredClients.map((client) => (
                      <SelectItem key={client.id} value={client.id} className="text-lg py-3">
                        {client.first_name} {client.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="border-t border-border"></div>

          {/* Datum + Dauer */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                {isMonthlyCategory ? "Monat" : "Datum"} <span className="text-destructive">*</span>
              </Label>
              {isMonthlyCategory ? (
                <Input
                  type="month"
                  className={cn(inputFieldBase, "text-center font-semibold tracking-wide")}
                  value={getMonthValue(formData.date)}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value ? `${e.target.value}-01` : "" })}
                  required
                />
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { key: "today", label: "Heute" },
                      { key: "yesterday", label: "Gestern" },
                      { key: "custom", label: "Datum …" },
                    ] as const).map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleDateChip(opt.key)}
                        className={cn(
                          "h-12 rounded-2xl border text-sm font-semibold transition-colors",
                          dateMode === opt.key
                            ? "bg-primary/10 border-transparent text-primary"
                            : "bg-card border-border text-muted-foreground"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {dateMode === "custom" && (
                    <Input
                      type="date"
                      className={cn(inputFieldBase, "text-center font-semibold tracking-wide mt-2")}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  )}
                </>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Arbeitsdauer <span className="text-destructive">*</span>
              </Label>

              <div className="text-center py-1">
                <span className="text-5xl font-bold tabular-nums text-foreground">{durationClock}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { label: "15 min", h: 0.25 },
                  { label: "30 min", h: 0.5 },
                  { label: "45 min", h: 0.75 },
                  { label: "1 Std", h: 1 },
                  { label: "1.5 Std", h: 1.5 },
                ].map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => setDurationFromHours(c.h)}
                    className="flex-1 min-w-[64px] h-11 rounded-2xl border border-border bg-card text-sm font-bold text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    {c.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setDurationFromHours(totalHours + 0.25)}
                  className="flex-1 min-w-[64px] h-11 rounded-2xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors"
                >
                  +15
                </button>
              </div>

              <Input
                type="time"
                aria-label="Dauer genau eingeben"
                className={cn(
                  inputFieldBase,
                  "text-center font-semibold tracking-wide tabular-nums [text-align-last:center] [&::-webkit-datetime-edit]:text-center"
                )}
                value={durationClock}
                onChange={handleDurationInputChange}
              />
            </div>
          </div>

          <div className="border-t border-border"></div>

          {/* Details (eingeklappt) */}
          <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center gap-3 rounded-2xl border border-dashed border-border p-4 text-left"
              >
                <Plus className="h-5 w-5 text-primary flex-none" />
                <span className="font-semibold text-foreground flex-1">Details hinzufügen</span>
                <span className="text-sm text-muted-foreground hidden xs:inline">Beschreibung · Kategorie · Notiz</span>
                <ChevronDown className={cn("h-5 w-5 text-primary transition-transform", detailsOpen && "rotate-180")} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Was wurde gemacht? <span className="text-muted-foreground text-sm font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  rows={4}
                  className={cn(textAreaBase)}
                  placeholder="Beschreibung der Tätigkeit..."
                  value={formData.activity_description}
                  onChange={(e) => setFormData({ ...formData, activity_description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-semibold">
                  Kategorie <span className="text-muted-foreground text-sm font-normal">(Interne Rapportierung, optional)</span>
                </Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger id="category" className={cn(inputFieldBase, "px-5 text-left font-semibold")}>
                    <SelectValue placeholder="Kategorie wählen (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.name} className="text-lg py-3">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-note" className="text-base font-semibold">
                  Sitzungsnotiz <span className="text-muted-foreground text-sm font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="session-note"
                  rows={4}
                  aria-label="Sitzungsnotiz zum Klienten, optional, Markdown wird unterstützt"
                  className={cn(textAreaBase)}
                  placeholder="Kurze Notiz zur Sitzung … (Markdown unterstützt)"
                  value={sessionNote}
                  onChange={(e) => setSessionNote(e.target.value)}
                  disabled={noteDisabled}
                />
                {isSingle && !formData.company_id && (
                  <p className="text-sm text-muted-foreground px-1">Zuerst Firma wählen, um eine Notiz zu hinterlegen.</p>
                )}
                {!isSingle && !formData.client_id && (
                  <p className="text-sm text-muted-foreground px-1">Zuerst Klient wählen, um eine Notiz zu hinterlegen.</p>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Heute erfasst */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Heute erfasst</h2>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="py-5">
                  <div className="animate-pulse flex justify-between">
                    <div className="h-6 bg-muted rounded w-32"></div>
                    <div className="h-6 bg-muted rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : todayEntries.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {todayEntries.map((entry) => (
                <TimeEntryListItem key={entry.id} entry={entry} onClick={() => setSelectedEntry(entry)} />
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-3.5 bg-muted/40 border-t border-border">
              <span className="font-semibold text-foreground">Heute gesamt</span>
              <span className="text-xl font-bold text-primary tabular-nums">
                {todayEntries.reduce((sum, entry) => sum + (entry.total_hours ?? 0), 0).toFixed(2)}h
              </span>
            </div>
          </Card>
        ) : (
          <Card className="shadow-sm border-2 border-dashed border-muted-foreground/30">
            <CardContent className="py-14 text-center">
              <Clock className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-lg font-bold text-foreground mb-1">Noch keine Einträge für heute</p>
              <p className="text-base text-muted-foreground">Erfassen Sie Ihre erste Arbeitszeit mit dem Formular oben</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sticky Speichern-Fusszeile */}
      <div className="fixed bottom-24 left-0 right-0 z-40 md:hidden px-4 py-3 bg-background/90 backdrop-blur-xl border-t border-border">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <div className="flex-none">
            <div className="text-xs font-medium text-muted-foreground">Dauer</div>
            <div className="text-lg font-bold tabular-nums text-foreground">{totalHours.toFixed(2)} h</div>
          </div>
          <Button
            className="flex-1 h-14 text-lg font-bold shadow-md active:scale-95 transition-transform"
            onClick={handleSubmit}
            disabled={isSubmitting || totalHours <= 0 || !formData.company_id || (!isSingle && !formData.client_id)}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />Wird gespeichert...</>
            ) : (
              <><Check className="h-5 w-5 mr-2" />Speichern</>
            )}
          </Button>
        </div>
      </div>

      <MobileTimeEntrySheet entry={selectedEntry} onOpenChange={(o) => !o && setSelectedEntry(null)} />
    </div>
  );
};

export default Zeit;
