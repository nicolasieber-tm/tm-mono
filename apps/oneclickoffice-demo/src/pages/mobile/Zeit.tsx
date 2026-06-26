import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTimeEntries, useCreateTimeEntry } from "@/hooks/useTimeEntries";
import { useKunden } from "@/hooks/useKunden";
import { useClients } from "@/hooks/useClients";
import { useTimeEntryCategories } from "@/hooks/useTimeEntryCategories";
import { useCreateClientNote } from "@/hooks/useClientNotes";
import { useIsSingleLevel } from "@/hooks/useClientHierarchyMode";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Database } from "@/integrations/supabase/types";

type TimeEntryWithRelations = Database["public"]["Tables"]["time_entries"]["Row"] & {
  clients?: { first_name: string; last_name: string } | null;
};

const inputFieldBase =
  "w-full h-[64px] text-lg font-semibold tracking-wide rounded-[28px] border border-border/60 bg-white shadow-sm transition-[border,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/70 placeholder:text-muted-foreground/70 appearance-none";

const textAreaBase =
  "w-full text-lg rounded-[32px] border border-border/60 bg-white shadow-sm transition-[border,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/70 placeholder:text-muted-foreground/70 resize-none min-h-[130px] leading-relaxed px-5 py-4";

const Zeit = () => {
  const { user } = useAuth();
  const isSingle = useIsSingleLevel();
  const { data: timeEntries, isLoading } = useTimeEntries();
  const { data: companies } = useKunden();
  const { data: clients } = useClients();
  const { data: categories } = useTimeEntryCategories();
  const createEntry = useCreateTimeEntry();
  const createClientNote = useCreateClientNote();

  const [formData, setFormData] = useState({
    company_id: "",
    client_id: "",
    date: new Date().toISOString().split('T')[0],
    activity_description: "",
    category: "",
  });
  const monthlyCategoryKeys = new Set(["kurzkontakte ganzer monat"]);
  const isMonthlyCategory = monthlyCategoryKeys.has(formData.category.trim().toLowerCase());
  const getMonthValue = (dateValue: string) => (dateValue ? dateValue.slice(0, 7) : "");

  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [sessionNote, setSessionNote] = useState("");

  // Filter clients by selected company
  const filteredClients = clients?.filter(
    (client) => client.company_id === formData.company_id
  ) || [];

  const totalHours = Number((durationHours + durationMinutes / 60).toFixed(2));

  const formatDuration = () => {
    if (durationHours === 0 && durationMinutes === 0) return "";
    const paddedHours = durationHours.toString().padStart(2, "0");
    const paddedMinutes = durationMinutes.toString().padStart(2, "0");
    return `${paddedHours}h ${paddedMinutes}min`;
  };

  const formatEndTimeFromDuration = (hours: number) => {
    const totalMinutes = Math.max(1, Math.round(hours * 60));
    const clampedMinutes = Math.min(totalMinutes, 23 * 60 + 59);
    const h = Math.floor(clampedMinutes / 60)
      .toString()
      .padStart(2, "0");
    const m = (clampedMinutes % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const formatTimeForDisplay = (time: string) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    return `${h ?? "00"}:${m ?? "00"}`;
  };

  const hasMeaningfulTimeRange = (start: string, end: string) => {
    if (!start || !end) return false;
    return !(start.startsWith("00:00") && end.startsWith("00:00"));
  };

  // Filter today's entries
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = timeEntries?.filter((entry) => entry.date === today) || [];

  const handleDurationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
        setDurationHours(h);
        setDurationMinutes(m);
    }
  };

  const handleSubmit = async () => {
    // Sammle alle fehlenden Felder
    const missingFields: string[] = [];
    if (!formData.company_id) missingFields.push("Firma");
    if (!isSingle && !formData.client_id) missingFields.push("Klient");
    if (!formData.date) {
      missingFields.push(isMonthlyCategory ? "Monat" : "Datum");
    }

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

    const entryDate =
      isMonthlyCategory && formData.date
        ? `${formData.date.slice(0, 7)}-01`
        : formData.date;

    // Step 1: time_entry anlegen. Fehler => Abbruch, Felder bleiben gefüllt (inkl. Notiz).
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

    // Step 2: optional client_note anlegen, wenn Text vorhanden.
    // XOR-Constraint: single_level => company_id gesetzt, client_id null.
    //                 two_level   => client_id gesetzt, company_id null.
    const trimmedNote = sessionNote.trim();

    if (trimmedNote !== "") {
      try {
        await createClientNote.mutateAsync(
          isSingle
            ? {
                companyId: formData.company_id,
                clientId: null,
                content: trimmedNote,
                sessionDate: entryDate,
              }
            : {
                clientId: formData.client_id,
                companyId: null,
                content: trimmedNote,
                sessionDate: entryDate,
              }
        );
      } catch {
        // Hook zeigt eigenen Error-Toast ("Fehler beim Speichern der Notiz").
        // Zeit-Felder NICHT zurücksetzen, Notiz-Text bleibt im Feld,
        // damit der User sieht, was passiert ist, und es nochmal versuchen kann.
        return;
      }
      // Notiz erfolgreich (Hook zeigt "Notiz gespeichert"-Toast): Feld leeren.
      setSessionNote("");
    }

    // Beide OK (oder Zeit OK + keine Notiz): Zeit-Felder zurücksetzen.
    setFormData({
      company_id: "",
      client_id: "",
      date: new Date().toISOString().split('T')[0],
      activity_description: "",
      category: "",
    });
    setDurationHours(0);
    setDurationMinutes(0);
  };

  const isSubmitting = createEntry.isPending || createClientNote.isPending;

  return (
    <div className="min-h-screen bg-background p-5 space-y-6 pb-28">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Zeit erfassen</h1>
        <p className="text-base text-muted-foreground">Erfassen Sie Ihre Arbeitszeit</p>
      </div>

      <Card className="shadow-md border-0 rounded-[32px]">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Neue Zeiterfassung</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-8">
          {/* Gruppe 1: Firma + Klient */}
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
                className={cn(
                  inputFieldBase,
                  "px-5 text-left font-semibold",
                  !formData.company_id && "opacity-70"
                )}
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

          {/* Separator */}
          <div className="border-t border-border"></div>

          {/* Gruppe 2: Datum + Dauer */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-base font-semibold">
                {isMonthlyCategory ? "Monat" : "Datum"} <span className="text-destructive">*</span>
              </Label>
            {isMonthlyCategory ? (
              <Input
                id="date"
                type="month"
                className={cn(inputFieldBase, "text-center font-semibold tracking-wide")}
                value={getMonthValue(formData.date)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    date: e.target.value ? `${e.target.value}-01` : "",
                  })
                }
                required
              />
            ) : (
              <Input
                id="date"
                type="date"
                className={cn(inputFieldBase, "text-center font-semibold tracking-wide")}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            )}
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">
                Arbeitsdauer <span className="text-destructive">*</span>
              </Label>

              <Input
                type="time"
                className={cn(
                  inputFieldBase,
                  "text-center font-semibold tracking-wide tabular-nums [text-align-last:center] [&::-webkit-datetime-edit]:text-center [&::-webkit-datetime-edit-fields-wrapper]:text-center"
                )}
                value={`${durationHours.toString().padStart(2, '0')}:${durationMinutes.toString().padStart(2, '0')}`}
                onChange={handleDurationInputChange}
              />

              {totalHours > 0 && (
                <div className="border-2 rounded-lg p-3 bg-primary/10 border-primary/30">
                  <p className="text-base font-bold text-center text-primary">
                    ✓ Total: {formatDuration()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-border"></div>

          {/* Gruppe 3: Optionale Felder */}
          <div className="space-y-4">
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
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
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
                disabled={(isSingle ? !formData.company_id : !formData.client_id) || isSubmitting}
              />
              {isSingle && !formData.company_id && (
                <p className="text-sm text-muted-foreground px-1">
                  Zuerst Firma wählen, um eine Notiz zu hinterlegen.
                </p>
              )}
              {!isSingle && !formData.client_id && (
                <p className="text-sm text-muted-foreground px-1">
                  Zuerst Klient wählen, um eine Notiz zu hinterlegen.
                </p>
              )}
            </div>
          </div>

          <Button
            className="w-full h-16 text-lg font-bold shadow-md active:scale-95 transition-transform mt-6"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              totalHours <= 0 ||
              !formData.company_id ||
              (!isSingle && !formData.client_id)
            }
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                Wird gespeichert...
              </>
            ) : (
              "Speichern"
            )}
          </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Heute erfasst</h2>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="py-5">
                  <div className="animate-pulse">
                    <div className="flex justify-between items-start mb-3">
                      <div className="h-6 bg-muted rounded w-32"></div>
                      <div className="h-6 bg-muted rounded w-16"></div>
                    </div>
                    <div className="h-5 bg-muted rounded w-48 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : todayEntries.length > 0 ? (
          <div className="space-y-4">
            {todayEntries.map((entry) => (
              <Card key={entry.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="py-5">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-primary font-bold text-xl">{entry.total_hours}h</span>
                    {hasMeaningfulTimeRange(entry.start_time, entry.end_time) && (
                      <span className="font-bold text-foreground text-lg">
                        {formatTimeForDisplay(entry.start_time)} - {formatTimeForDisplay(entry.end_time)}
                      </span>
                    )}
                  </div>
                  <div className="text-base text-foreground font-semibold mb-2">
                    {(entry as TimeEntryWithRelations).clients
                      ? `${(entry as TimeEntryWithRelations).clients!.first_name} ${(entry as TimeEntryWithRelations).clients!.last_name}`
                      : "-"}
                  </div>
                  {entry.category && (
                    <div className="mb-2">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                        {entry.category}
                      </span>
                    </div>
                  )}
                  {entry.activity_description && (
                    <div className="text-base text-muted-foreground mt-2">{entry.activity_description}</div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Tages-Zusammenfassung */}
            <Card className="shadow-sm bg-primary/5 border-primary/30">
              <CardContent className="py-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-foreground">Heute gesamt</span>
                  <span className="text-2xl font-bold text-primary">
                    {todayEntries.reduce((sum, entry) => sum + entry.total_hours, 0).toFixed(2)}h
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="shadow-sm border-2 border-dashed border-muted-foreground/30">
            <CardContent className="py-16 text-center">
              <div className="mb-6">
                <Clock className="h-20 w-20 mx-auto text-muted-foreground/40" />
              </div>
              <p className="text-xl font-bold text-foreground mb-2">
                Noch keine Einträge für heute
              </p>
              <p className="text-base text-muted-foreground mb-6">
                Erfassen Sie Ihre erste Arbeitszeit mit dem Formular oben
              </p>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setTimeout(() => {
                    document.getElementById('company')?.focus();
                  }, 500);
                }}
              >
                <Clock className="h-5 w-5 mr-2" />
                Jetzt erfassen
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
};

export default Zeit;
