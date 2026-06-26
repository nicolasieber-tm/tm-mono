import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, StickyNote, Search, X } from "lucide-react";
import { useClientNotes } from "@/hooks/useClientNotes";
import { useEmployees } from "@/hooks/useEmployees";
import { ClientNoteEditor } from "./ClientNoteEditor";
import { ClientNoteListItem } from "./ClientNoteListItem";

interface Props {
  clientId: string;
}

const NoteSkeleton = () => (
  <div className="flex items-start gap-4 pb-5">
    <div className="relative z-10 h-8 w-8 shrink-0 rounded-full bg-muted ring-4 ring-background animate-pulse" />
    <div className="flex-1 rounded-lg border bg-card p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-3 w-32 rounded bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
      </div>
    </div>
  </div>
);

export const ClientNotesTab = ({ clientId }: Props) => {
  const { data: notes, isLoading } = useClientNotes(clientId);
  const { data: employees } = useEmployees();
  const [isCreating, setIsCreating] = useState(false);
  const [query, setQuery] = useState("");

  const hasAnyNotes = (notes?.length ?? 0) > 0;

  // Client-side Suche: Content + Autor-Name + Datum (Erstell- UND Sitzungsdatum,
  // mehrere Formate: 15.04.2026, 2026-04-15, April/Apr). Case-insensitive Substring.
  const filteredNotes = useMemo(() => {
    if (!notes) return [];
    const q = query.trim().toLowerCase();
    if (!q) return notes;

    return notes.filter((n) => {
      if (n.content.toLowerCase().includes(q)) return true;

      if (n.author_id) {
        const emp = employees?.find((e) => e.id === n.author_id);
        if (emp) {
          const full = `${emp.first_name} ${emp.last_name}`.toLowerCase();
          if (full.includes(q)) return true;
        }
      }

      // Datums-Such-Heuhaufen: beide Daten in allen gängigen Schreibweisen
      const dates: string[] = [n.created_at];
      if (n.session_date) dates.push(n.session_date + "T00:00:00");

      for (const iso of dates) {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) continue;
        const haystacks = [
          iso.toLowerCase(), // z.B. "2026-04-15t..."
          d.toLocaleDateString("de-CH", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }), // 15.04.2026
          d.toLocaleDateString("de-CH", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }).toLowerCase(), // 15. april 2026
          d.toLocaleDateString("de-CH", { month: "short" }).toLowerCase(), // apr
          d.toLocaleDateString("de-CH", { month: "long" }).toLowerCase(), // april
        ];
        if (haystacks.some((h) => h.includes(q))) return true;
      }

      return false;
    });
  }, [notes, employees, query]);

  const hasMatches = filteredNotes.length > 0;
  const isSearching = query.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-none">Sitzungsnotizen</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Chronologischer Verlauf pro Termin. Jeder im Team kann Notizen erfassen und bearbeiten.
          </p>
        </div>
        {!isCreating && (
          <Button size="sm" onClick={() => setIsCreating(true)} className="shrink-0">
            <Plus className="mr-1 h-4 w-4" />
            Neue Notiz
          </Button>
        )}
      </div>

      {/* Search (nur zeigen wenn überhaupt Notizen existieren) */}
      {hasAnyNotes && (
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nach Stichwort, Autor oder Datum suchen (z.B. 15.04 oder April) …"
            className="pl-8 pr-9 h-9"
            aria-label="Sitzungsnotizen durchsuchen"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Suche zurücksetzen"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Timeline Container */}
      <div className="relative">
        {/* Vertikale Timeline-Linie (hinter allen Nodes) */}
        {(isLoading || hasAnyNotes || isCreating) && (
          <div
            aria-hidden="true"
            className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-border to-transparent"
          />
        )}

        {/* Neue-Notiz Editor als oberster Timeline-Node */}
        {isCreating && (
          <div className="relative flex items-start gap-4 pb-5 animate-in fade-in-0 slide-in-from-top-2 duration-200">
            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-primary/60 bg-background text-primary">
              <Plus className="h-4 w-4" />
            </div>
            <div className="flex-1 rounded-lg border border-primary/40 bg-primary/5 p-4">
              <ClientNoteEditor
                mode="create"
                clientId={clientId}
                onDone={() => setIsCreating(false)}
                onCancel={() => setIsCreating(false)}
              />
            </div>
          </div>
        )}

        {/* Loading-State */}
        {isLoading && (
          <>
            <NoteSkeleton />
            <NoteSkeleton />
          </>
        )}

        {/* Suchergebnisse / Liste */}
        {!isLoading && hasAnyNotes && hasMatches && (
          <>
            {filteredNotes.map((note) => (
              <ClientNoteListItem key={note.id} note={note} employees={employees} />
            ))}
          </>
        )}

        {/* Keine Treffer bei aktiver Suche */}
        {!isLoading && hasAnyNotes && isSearching && !hasMatches && (
          <div className="relative flex items-start gap-4">
            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground ring-4 ring-background">
              <Search className="h-4 w-4" />
            </div>
            <div className="flex-1 rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-center">
              <p className="text-sm font-medium">Keine Notiz gefunden</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Kein Eintrag enthält „{query}"
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setQuery("")}
              >
                Suche zurücksetzen
              </Button>
            </div>
          </div>
        )}

        {/* Empty-State: noch keine Notizen überhaupt */}
        {!isLoading && !hasAnyNotes && !isCreating && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
              <StickyNote className="h-6 w-6" aria-hidden="true" />
            </div>
            <h4 className="mt-3 text-sm font-medium">Noch keine Sitzungsnotizen</h4>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Halte nach jedem Termin kurz fest, was behandelt wurde und was beim nächsten Mal ansteht.
            </p>
            <Button size="sm" className="mt-4" onClick={() => setIsCreating(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Erste Notiz erfassen
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
