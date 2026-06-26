import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  type ClientNote,
  useCreateClientNote,
  useUpdateClientNote,
} from "@/hooks/useClientNotes";

interface Props {
  mode: "create" | "edit";
  initialNote?: ClientNote;
  /** XOR: pass clientId (two_level) or companyId (single_level). */
  clientId?: string | null;
  companyId?: string | null;
  onDone: () => void;
  onCancel: () => void;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export const ClientNoteEditor = ({ mode, initialNote, clientId, companyId, onDone, onCancel }: Props) => {
  const [content, setContent] = useState(initialNote?.content ?? "");
  const [sessionDate, setSessionDate] = useState(
    initialNote?.session_date ?? (mode === "create" ? todayIso() : "")
  );

  const create = useCreateClientNote();
  const update = useUpdateClientNote();

  const isPending = create.isPending || update.isPending;
  const isValid = content.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      if (mode === "create") {
        await create.mutateAsync({
          clientId: clientId ?? null,
          companyId: companyId ?? null,
          content: content.trim(),
          sessionDate: sessionDate || null,
        });
      } else if (initialNote) {
        await update.mutateAsync({
          id: initialNote.id,
          clientId: clientId ?? null,
          companyId: companyId ?? null,
          content: content.trim(),
          sessionDate: sessionDate || null,
        });
      }
      onDone();
    } catch {
      // toast from hook handles user feedback; keep the editor open
    }
  };

  const editorId = `note-content-${mode}`;
  const dateId = `note-session-date-${mode}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={editorId} className="text-sm font-medium">
          {mode === "edit" ? "Notiz bearbeiten" : "Neue Sitzungsnotiz"}
        </Label>
        <Textarea
          id={editorId}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Heute Schulter rechts mobilisiert. Nächstes Mal Nacken fokussieren …"
          rows={8}
          className="resize-y min-h-[160px] text-base leading-relaxed"
          autoFocus
          required
          disabled={isPending}
        />
        <p className="text-[11px] text-muted-foreground">
          Markdown unterstützt: <code className="font-mono">**fett**</code>, <code className="font-mono">*kursiv*</code>, <code className="font-mono">- Listen</code>
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={dateId} className="text-sm font-medium">
          Sitzungsdatum <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id={dateId}
          type="date"
          value={sessionDate ?? ""}
          onChange={(e) => setSessionDate(e.target.value)}
          className="w-auto"
          disabled={isPending}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
          Abbrechen
        </Button>
        <Button type="submit" disabled={!isValid || isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird gespeichert…
            </>
          ) : mode === "edit" ? (
            "Änderungen speichern"
          ) : (
            "Notiz speichern"
          )}
        </Button>
      </div>
    </form>
  );
};
