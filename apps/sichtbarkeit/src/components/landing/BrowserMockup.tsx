import { cn } from "@/lib/utils";

interface BrowserMockupProps {
  variant?: "modern" | "outdated";
  className?: string;
  label?: string;
}

export const BrowserMockup = ({ variant = "modern", className, label }: BrowserMockupProps) => {
  const isModern = variant === "modern";

  return (
    <div className={cn("relative rounded-2xl border border-border bg-card shadow-card overflow-hidden", className)}>
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
        </div>
        <div className="ml-3 flex-1 truncate rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
          ihr-unternehmen.ch
        </div>
      </div>

      {isModern ? (
        <div className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-primary" />
              <div className="h-2.5 w-20 rounded bg-foreground/80" />
            </div>
            <div className="flex gap-2">
              <div className="h-2 w-10 rounded bg-foreground/20" />
              <div className="h-2 w-10 rounded bg-foreground/20" />
              <div className="h-2 w-10 rounded bg-foreground/20" />
            </div>
          </div>
          <div className="space-y-3 pt-4">
            <div className="h-3.5 w-3/4 rounded bg-foreground/85" />
            <div className="h-3.5 w-2/3 rounded bg-foreground/85" />
            <div className="h-2 w-full rounded bg-foreground/20" />
            <div className="h-2 w-5/6 rounded bg-foreground/20" />
            <div className="flex gap-2 pt-2">
              <div className="h-8 w-28 rounded-lg bg-primary" />
              <div className="h-8 w-24 rounded-lg border border-border" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="aspect-[4/3] rounded-xl bg-primary-soft" />
            <div className="aspect-[4/3] rounded-xl bg-muted" />
            <div className="aspect-[4/3] rounded-xl bg-muted" />
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-6 opacity-70">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 rounded-sm bg-foreground/40" />
            <div className="flex gap-3">
              <div className="h-2 w-8 bg-foreground/30" />
              <div className="h-2 w-10 bg-foreground/30" />
              <div className="h-2 w-6 bg-foreground/30" />
            </div>
          </div>
          <div className="h-24 w-full bg-foreground/10" />
          <div className="space-y-2">
            <div className="h-2 w-full bg-foreground/25" />
            <div className="h-2 w-11/12 bg-foreground/25" />
            <div className="h-2 w-10/12 bg-foreground/25" />
            <div className="h-2 w-9/12 bg-foreground/25" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-16 bg-foreground/10" />
            <div className="h-16 bg-foreground/10" />
          </div>
        </div>
      )}

      {label && (
        <div className="absolute left-4 top-14 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          {label}
        </div>
      )}
    </div>
  );
};
