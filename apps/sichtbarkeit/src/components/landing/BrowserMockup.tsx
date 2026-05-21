import { cn } from "@/lib/utils";

interface BrowserMockupProps {
  variant?: "modern" | "outdated";
  className?: string;
  label?: string;
}

export const BrowserMockup = ({ variant = "modern", className, label }: BrowserMockupProps) => {
  const isModern = variant === "modern";

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden border",
        isModern ? "c-border-soft" : "c-border-faint",
        className
      )}
      style={{
        backgroundColor: isModern ? "hsl(var(--c-surface))" : "hsl(var(--c-surface-2))",
        boxShadow: isModern
          ? "0 24px 60px -20px rgba(124, 58, 237, 0.35), 0 0 0 1px rgba(167, 139, 250, 0.15)"
          : "0 12px 30px -16px rgba(0,0,0,0.5)",
      }}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b c-border-faint c-fill-3 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full c-fill-8" />
          <span className="h-2.5 w-2.5 rounded-full c-fill-8" />
          <span className="h-2.5 w-2.5 rounded-full c-fill-8" />
        </div>
        <div className="ml-3 flex-1 truncate rounded-md c-fill-2 px-3 py-1 font-mono text-[10px] c-text-55">
          ihr-unternehmen.ch
        </div>
      </div>

      {isModern ? (
        <div className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md" style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)" }} />
              <div className="h-2.5 w-20 rounded c-fill-8" />
            </div>
            <div className="flex gap-2">
              <div className="h-2 w-10 rounded c-fill-6" />
              <div className="h-2 w-10 rounded c-fill-6" />
              <div className="h-2 w-10 rounded c-fill-6" />
            </div>
          </div>
          <div className="space-y-3 pt-4">
            <div className="h-3.5 w-3/4 rounded c-fill-8" />
            <div className="h-3.5 w-2/3 rounded c-fill-8" />
            <div className="h-2 w-full rounded c-fill-4" />
            <div className="h-2 w-5/6 rounded c-fill-4" />
            <div className="flex gap-2 pt-2">
              <div
                className="h-8 w-28 rounded-lg"
                style={{ background: "linear-gradient(90deg, #a78bfa, #7c3aed)" }}
              />
              <div className="h-8 w-24 rounded-lg border c-border-soft" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pt-4">
            <div
              className="aspect-[4/3] rounded-xl"
              style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.22), rgba(124,58,237,0.10))" }}
            />
            <div className="aspect-[4/3] rounded-xl c-fill-4" />
            <div className="aspect-[4/3] rounded-xl c-fill-4" />
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-6 opacity-70">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 rounded-sm c-fill-8" />
            <div className="flex gap-3">
              <div className="h-2 w-8 c-fill-6" />
              <div className="h-2 w-10 c-fill-6" />
              <div className="h-2 w-6 c-fill-6" />
            </div>
          </div>
          <div className="h-24 w-full c-fill-3" />
          <div className="space-y-2">
            <div className="h-2 w-full c-fill-4" />
            <div className="h-2 w-11/12 c-fill-4" />
            <div className="h-2 w-10/12 c-fill-4" />
            <div className="h-2 w-9/12 c-fill-4" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-16 c-fill-3" />
            <div className="h-16 c-fill-3" />
          </div>
        </div>
      )}

      {label && (
        <div className="absolute left-4 top-14 rounded-full c-fill-6 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] c-text-70 backdrop-blur">
          {label}
        </div>
      )}
    </div>
  );
};
