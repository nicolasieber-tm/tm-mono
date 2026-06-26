import { cn } from "@/lib/utils";
import { Folder } from "lucide-react";

type Variant = "company" | "client";

type Props = {
  variant: Variant;
  title: string;
  subtitle?: string | null; // z.B. "Heute", "vor 3 Tagen"
  count?: number; // optional: wenn undefined, wird die Zähler-Zeile ausgeblendet
  countLabel?: string; // "Klienten" | "Klient" | "Notizen" | "Notiz"
  isCurrent?: boolean; // z.B. Klient mit Notiz von heute
  onClick: () => void;
};

export function NotesFolderCard({
  variant,
  title,
  subtitle,
  count,
  countLabel,
  isCurrent,
  onClick,
}: Props) {
  const accentGradient = isCurrent
    ? "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)"
    : "linear-gradient(135deg, #f3f4f6 0%, #f9fafb 100%)";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-white p-[18px] shadow-sm cursor-pointer transition-all text-left w-full",
        "hover:-translate-y-0.5 hover:shadow-lg hover:border-slate-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "border-slate-200"
      )}
    >
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 w-20 h-20 rounded-bl-[80px] opacity-70 pointer-events-none"
        style={{ background: accentGradient }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-[14px] min-h-[20px]">
          {isCurrent ? (
            <div className="bg-blue-50 text-blue-600 text-[9px] font-bold px-[7px] py-[2px] rounded uppercase tracking-wider">
              Aktiv
            </div>
          ) : (
            <div />
          )}

          <Folder
            className={cn(
              "h-5 w-5",
              isCurrent ? "text-blue-500" : "text-slate-400"
            )}
          />
        </div>

        {subtitle && (
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            {subtitle}
          </div>
        )}
        <div
          lang="de"
          className={cn(
            "font-extrabold text-slate-900 tracking-tight hyphens-auto break-words",
            variant === "company"
              ? "text-[22px] -tracking-[0.02em] leading-tight"
              : "text-[20px] -tracking-[0.02em] leading-tight"
          )}
        >
          {title}
        </div>

        {count !== undefined && (
          <div className="flex justify-between items-end mt-4">
            <div className="text-[11px] text-slate-500">
              <b className="text-slate-900 text-[13px]">{count}</b> {countLabel}
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
