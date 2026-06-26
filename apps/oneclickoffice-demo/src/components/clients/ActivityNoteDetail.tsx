import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import {
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2, StickyNote, Calendar as CalendarIcon } from "lucide-react";
import { useClientNote, useSoftDeleteClientNote } from "@/hooks/useClientNotes";
import { ClientNoteEditor } from "./ClientNoteEditor";
import { noteMarkdownComponents } from "./noteMarkdown";

interface Props {
  id: string;
  onClose: () => void;
}

const formatSessionDate = (ymd: string) => {
  const d = new Date(ymd + "T00:00:00");
  return d.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export const ActivityNoteDetail = ({ id, onClose }: Props) => {
  const queryClient = useQueryClient();
  const { data: note, isLoading, error } = useClientNote(id);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const softDelete = useSoftDeleteClientNote();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["client-notes"] });
    queryClient.invalidateQueries({ queryKey: ["client-timeline"] });
  };

  return (
    <>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-primary" />
          Sitzungsnotiz
        </DialogTitle>
        <DialogDescription className="sr-only">Notizdetails</DialogDescription>

        {isLoading && (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
        {error && !isLoading && (
          <p className="py-8 text-center text-sm text-destructive">
            Notiz konnte nicht geladen werden.
          </p>
        )}

        {note && !isLoading && !isEditing && (
          <div className="space-y-4">
            {note.session_date && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
                <CalendarIcon className="h-3 w-3" aria-hidden="true" />
                Sitzung {formatSessionDate(note.session_date)}
              </span>
            )}
            <div className="text-sm text-foreground break-words [overflow-wrap:anywhere]">
              <ReactMarkdown components={noteMarkdownComponents}>{note.content}</ReactMarkdown>
            </div>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Bearbeiten
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Löschen
              </Button>
            </div>
          </div>
        )}

        {note && !isLoading && isEditing && (
          <ClientNoteEditor
            mode="edit"
            initialNote={note}
            clientId={note.client_id}
            companyId={note.company_id}
            onDone={() => {
              setIsEditing(false);
              refresh();
            }}
            onCancel={() => setIsEditing(false)}
          />
        )}
      </DialogContent>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Notiz löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Notiz wird ausgeblendet und kann später nicht mehr im Klient-Verlauf
              gesehen werden. Möchten Sie sie wirklich löschen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                if (!note) return;
                await softDelete.mutateAsync({
                  id: note.id,
                  clientId: note.client_id,
                  companyId: note.company_id,
                });
                setIsDeleteOpen(false);
                refresh();
                onClose();
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
    </>
  );
};
