import { cn } from "@/lib/utils";
import { Folder, Download } from "lucide-react";
import { formatCHF } from "./formatters";
import { hyphenateGermanCompound } from "./hyphenate";

type Variant = "year" | "month" | "category";

type Props = {
  variant: Variant;
  title: string;
  subtitle?: string;             // e.g. monthnum "04" for month variant
  count: number;
  total: number;
  isCurrent?: boolean;
  isUncategorized?: boolean;
  iconEmoji?: string | null;     // for category variant
  iconColor?: string | null;     // hex like "#f59e0b"
  onClick: () => void;
  onDownload?: () => void;
};

export function FolderCard({
  variant,
  title,
  subtitle,
  count,
  total,
  isCurrent,
  isUncategorized,
  onClick,
  onDownload,
}: Props) {
  const accentGradient = isCurrent
    ? "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)"
    : "linear-gradient(135deg, #f3f4f6 0%, #f9fafb 100%)";

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-white p-[18px] shadow-sm cursor-pointer transition-all",
        "hover:-translate-y-0.5 hover:shadow-lg hover:border-slate-300",
        isUncategorized ? "border-amber-400" : "border-slate-200"
      )}
    >
      <div
        className="absolute top-0 right-0 w-20 h-20 rounded-bl-[80px] opacity-70 pointer-events-none"
        style={{ background: accentGradient }}
      />

      {onDownload && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDownload();
          }}
          title={`${title} als CSV`}
          className={cn(
            "absolute top-2.5 right-2.5 z-10 flex h-[30px] w-[30px] items-center justify-center rounded-lg",
            "border border-slate-200 bg-white text-slate-900 shadow-sm",
            "opacity-0 -translate-y-1 transition-all",
            "group-hover:opacity-100 group-hover:translate-y-0",
            "hover:bg-slate-900 hover:text-white hover:border-slate-900"
          )}
        >
          <Download className="h-3.5 w-3.5" />
        </button>
      )}

      <div className="relative">
        <div className="flex items-start justify-between mb-[14px] min-h-[20px]">
          {isCurrent ? (
            <div className="bg-blue-50 text-blue-600 text-[9px] font-bold px-[7px] py-[2px] rounded uppercase tracking-wider">
              Aktuell
            </div>
          ) : isUncategorized ? (
            <div className="bg-amber-50 text-amber-700 text-[9px] font-bold px-[7px] py-[2px] rounded uppercase tracking-wider">
              ⚠ Aufräumen
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
          <div className="text-[11px] font-semibold text-slate-500 uppercase">
            {subtitle}
          </div>
        )}
        <div
          lang="de"
          className={cn(
            "font-extrabold text-slate-900 tracking-tight hyphens-auto break-words",
            variant === "year"
              ? "text-[32px] -tracking-[0.03em] leading-none"
              : "text-[22px] -tracking-[0.02em] leading-tight"
          )}
        >
          {hyphenateGermanCompound(title)}
        </div>

        <div className="flex justify-between items-end mt-4">
          <div className="text-[11px] text-slate-500">
            <b className="text-slate-900 text-[13px]">{count}</b>{" "}
            {count === 1 ? "Beleg" : "Belege"}
          </div>
          <div
            className={cn(
              "text-[13px] font-bold",
              isCurrent ? "text-blue-600" : "text-slate-900"
            )}
          >
            CHF {formatCHF(total)}
          </div>
        </div>
      </div>
    </div>
  );
}
