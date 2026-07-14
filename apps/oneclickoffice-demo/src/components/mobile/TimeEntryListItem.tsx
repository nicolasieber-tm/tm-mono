import { Clock, ChevronRight } from "lucide-react";
import { TimeEntryRow } from "@/hooks/useTimeStats";

interface Props {
  entry: TimeEntryRow;
  onClick?: () => void;
}

/** Anzeigename: Klient (2-Ebenen) oder Firma (Single-Level) als Fallback. */
const displayName = (entry: TimeEntryRow) => {
  if (entry.clients) return `${entry.clients.first_name} ${entry.clients.last_name}`;
  if (entry.kunden) return entry.kunden.name;
  return "Ohne Zuordnung";
};

const TimeEntryListItem = ({ entry, onClick }: Props) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50 active:scale-[0.99]"
    >
      <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-none">
        <Clock className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-foreground truncate">{displayName(entry)}</div>
        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5 min-w-0">
          {entry.category && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex-none">
              {entry.category}
            </span>
          )}
          {entry.activity_description && (
            <span className="truncate">{entry.activity_description}</span>
          )}
        </div>
      </div>
      <div className="font-bold tabular-nums text-foreground flex-none">
        {(entry.total_hours ?? 0).toFixed(2)}
        <span className="text-xs font-medium text-muted-foreground"> h</span>
      </div>
      {onClick && <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-none" />}
    </button>
  );
};

export default TimeEntryListItem;
