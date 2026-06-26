import { useState } from "react";
import { ActivityDetailOverlay, type ActivityDetailEvent } from "./ActivityDetailOverlay";
import {
  StickyNote,
  FileText,
  Clock,
  Wallet,
  History,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClientTimeline } from "@/hooks/useClientTimeline";
import { formatCHF, formatDateDE } from "@/components/expenses/formatters";
import type { TimelineEvent, TimelineEventType } from "@/utils/clientTimeline";

const PAGE_SIZE = 20;

interface TypeMeta {
  label: string;
  icon: LucideIcon;
  node: string; // Tailwind-Klassen für den Node-Kreis
}

const TYPE_META: Record<TimelineEventType, TypeMeta> = {
  note: { label: "Notizen", icon: StickyNote, node: "bg-primary text-primary-foreground" },
  invoice: { label: "Rechnungen", icon: FileText, node: "bg-blue-600 text-white" },
  time: { label: "Zeit", icon: Clock, node: "bg-green-600 text-white" },
  expense: { label: "Spesen", icon: Wallet, node: "bg-amber-500 text-white" },
};

const FILTER_ORDER: TimelineEventType[] = ["note", "invoice", "time", "expense"];

const INVOICE_STATUS_LABEL: Record<string, string> = {
  draft: "Entwurf",
  sent: "Offen",
  paid: "Bezahlt",
};

interface Props {
  clientId: string;
}

const RowSkeleton = () => (
  <div className="flex items-start gap-3 pb-5">
    <div className="relative z-10 h-8 w-8 shrink-0 rounded-full bg-muted ring-4 ring-background animate-pulse" />
    <div className="flex-1 rounded-lg border bg-card p-4 animate-pulse">
      <div className="h-3 w-40 rounded bg-muted" />
      <div className="mt-2 h-3 w-3/4 rounded bg-muted" />
    </div>
  </div>
);

export const ClientTimeline = ({ clientId }: Props) => {
  const { events, isLoading, error } = useClientTimeline(clientId);
  const [active, setActive] = useState<Set<TimelineEventType>>(new Set());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<ActivityDetailEvent | null>(null);

  // Leeres Set = "Alle anzeigen".
  const filtered = active.size === 0 ? events : events.filter((e) => active.has(e.type));
  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visible.length;

  const toggle = (t: TimelineEventType) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
    setVisibleCount(PAGE_SIZE);
  };

  const clearFilter = () => {
    setActive(new Set());
    setVisibleCount(PAGE_SIZE);
  };

  const handleOpen = (e: TimelineEvent) => {
    // e.id hat die Form `${type}:${recordId}` — wir brauchen die rohe ID.
    const rawId = e.id.substring(e.id.indexOf(":") + 1);
    setSelected({ type: e.type, id: rawId });
  };

  const chipClass = (isActive: boolean) =>
    `rounded-full px-3 py-1 text-xs font-medium transition-colors ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "bg-muted text-muted-foreground hover:bg-muted/80"
    }`;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Verlauf</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Alle Ereignisse dieses Klienten chronologisch – neuestes zuoberst.
        </p>
      </div>

      {/* Filter-Chips */}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={clearFilter} className={chipClass(active.size === 0)}>
          Alle
        </button>
        {FILTER_ORDER.map((t) => (
          <button key={t} type="button" onClick={() => toggle(t)} className={chipClass(active.has(t))}>
            {TYPE_META[t].label}
          </button>
        ))}
      </div>

      {/* Inhalt */}
      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-6 text-center text-sm text-destructive">
          Verlauf konnte nicht geladen werden.
        </div>
      ) : (
        <div className="relative">
          {(isLoading || visible.length > 0) && (
            <div
              aria-hidden="true"
              className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-border to-transparent"
            />
          )}

          {isLoading && (
            <>
              <RowSkeleton />
              <RowSkeleton />
            </>
          )}

          {!isLoading &&
            visible.map((e) => {
              const meta = TYPE_META[e.type];
              const Icon = meta.icon;
              const statusLabel =
                e.type === "invoice" && e.status ? INVOICE_STATUS_LABEL[e.status] ?? e.status : null;
              return (
                <div key={e.id} className="relative flex items-start gap-3 pb-5 last:pb-0">
                  <div
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-background ${meta.node}`}
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpen(e)}
                    className="min-w-0 flex-1 rounded-lg border bg-card/80 px-3 py-3 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="text-xs text-muted-foreground">{formatDateDE(e.date)}</span>
                          <span className="text-sm font-medium text-foreground">{e.title}</span>
                        </div>
                        {e.subtitle && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">{e.subtitle}</p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {typeof e.amount === "number" && (
                          <span className="text-sm font-semibold">CHF {formatCHF(e.amount)}</span>
                        )}
                        {statusLabel && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {statusLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}

          {!isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                <History className="h-6 w-6" aria-hidden="true" />
              </div>
              <h4 className="mt-3 text-sm font-medium">Noch keine Ereignisse</h4>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Sobald Notizen, Rechnungen, Zeiteinträge oder Spesen erfasst sind, erscheinen sie hier.
              </p>
            </div>
          )}

          {!isLoading && hasMore && (
            <div className="pt-2 text-center">
              <Button variant="outline" size="sm" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                Mehr laden
              </Button>
            </div>
          )}
        </div>
      )}
      <ActivityDetailOverlay event={selected} onClose={() => setSelected(null)} />
    </div>
  );
};
