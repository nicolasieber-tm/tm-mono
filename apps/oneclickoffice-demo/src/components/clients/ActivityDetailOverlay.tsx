import { Dialog } from "@/components/ui/dialog";
import type { TimelineEventType } from "@/utils/clientTimeline";
import { ActivityTimeDetail } from "./ActivityTimeDetail";
import { ActivityExpenseDetail } from "./ActivityExpenseDetail";
import { ActivityNoteDetail } from "./ActivityNoteDetail";
import { ActivityInvoiceDetail } from "./ActivityInvoiceDetail";

export interface ActivityDetailEvent {
  type: TimelineEventType;
  /** Rohe Datensatz-ID (ohne `${type}:`-Präfix aus der Timeline). */
  id: string;
}

interface Props {
  event: ActivityDetailEvent | null;
  onClose: () => void;
}

export const ActivityDetailOverlay = ({ event, onClose }: Props) => {
  return (
    <Dialog open={event !== null} onOpenChange={(open) => !open && onClose()}>
      {event?.type === "time" && <ActivityTimeDetail id={event.id} onClose={onClose} />}
      {event?.type === "expense" && <ActivityExpenseDetail id={event.id} onClose={onClose} />}
      {event?.type === "note" && <ActivityNoteDetail id={event.id} onClose={onClose} />}
      {event?.type === "invoice" && <ActivityInvoiceDetail id={event.id} />}
    </Dialog>
  );
};
