import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { type ClientNote, useSoftDeleteClientNote } from "@/hooks/useClientNotes";
import { ClientNoteEditor } from "./ClientNoteEditor";
import { noteMarkdownComponents } from "./noteMarkdown";
import type { Database } from "@/integrations/supabase/types";

type Employee = Database["public"]["Tables"]["employees"]["Row"];

interface Props {
  note: ClientNote;
  employees: Employee[] | undefined;
}

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })
  );
};

const formatSessionDate = (ymd: string) => {
  const d = new Date(ymd + "T00:00:00");
  return d.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const initialsFrom = (first?: string | null, last?: string | null) => {
  const f = (first ?? "").trim().charAt(0).toUpperCase();
  const l = (last ?? "").trim().charAt(0).toUpperCase();
  return (f + l) || "?";
};


export const ClientNoteListItem = ({ note, employees }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const softDelete = useSoftDeleteClientNote();

  const author = note.author_id
    ? employees?.find((e) => e.id === note.author_id)
    : null;

  const authorLabel = note.author_id
    ? author
      ? `${author.first_name} ${author.last_name}`
      : "…"
    : "(ehemaliger Mitarbeiter)";

  const authorInitials = note.author_id
    ? author
      ? initialsFrom(author.first_name, author.last_name)
      : "…"
    : "—";

  return (
    <div className="group relative flex items-start gap-2 sm:gap-4 pb-5 last:pb-0 animate-in fade-in-0 slide-in-from-top-1 duration-300">
      {/* Timeline node: Avatar-Kreis mit Initialen, sitzt auf der Linie */}
      <div
        className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground shadow-sm ring-4 ring-background"
        title={authorLabel}
        aria-label={`Erfasst von ${authorLabel}`}
      >
        {authorInitials}
      </div>

      {/* Card rechts davon */}
      {isEditing ? (
        <div className="flex-1 rounded-lg border border-primary/40 bg-primary/5 p-4 animate-in fade-in-0 duration-200">
          <ClientNoteEditor
            mode="edit"
            initialNote={note}
            clientId={note.client_id}
            companyId={note.company_id}
            onDone={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <div className="min-w-0 flex-1 rounded-lg border bg-card/80 px-3 sm:px-4 py-3 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs">
              <span className="font-medium text-foreground">{authorLabel}</span>
              <span className="text-muted-foreground">{formatDateTime(note.created_at)}</span>
              {note.session_date && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
                  <CalendarIcon className="h-3 w-3" aria-hidden="true" />
                  Sitzung {formatSessionDate(note.session_date)}
                </span>
              )}
              {note.updated_at !== note.created_at && (
                <span className="italic text-muted-foreground">bearbeitet</span>
              )}
            </div>
            <div className="flex shrink-0 opacity-100 sm:opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsEditing(true)}
                aria-label="Notiz bearbeiten"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => setIsDeleteOpen(true)}
                aria-label="Notiz löschen"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="text-sm text-foreground break-words [overflow-wrap:anywhere]">
            <ReactMarkdown components={noteMarkdownComponents}>{note.content}</ReactMarkdown>
          </div>
        </div>
      )}

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Notiz löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Notiz wird ausgeblendet und kann später nicht mehr im Klient-Verlauf gesehen werden. Möchten Sie sie wirklich löschen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                await softDelete.mutateAsync({
                  id: note.id,
                  clientId: note.client_id,
                  companyId: note.company_id,
                });
                setIsDeleteOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={softDelete.isPending}
            >
              {softDelete.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gelöscht…
                </>
              ) : (
                "Löschen"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
