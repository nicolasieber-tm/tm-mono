import { cn } from "@/lib/utils";
import { ChevronRight, Folder } from "lucide-react";

type Crumb = {
  label: string;
  onClick?: () => void;
  active?: boolean;
  icon?: React.ReactNode;
};

type Props = {
  crumbs: Crumb[];
};

export function NotesBreadcrumb({ crumbs }: Props) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-[13px] overflow-x-auto scrollbar-hide min-w-0"
    >
      {crumbs.map((c, i) => (
        <div key={i} className="flex items-center gap-2 shrink-0">
          {i > 0 && (
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
          )}
          <button
            type="button"
            disabled={c.active || !c.onClick}
            onClick={c.onClick}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap",
              c.active
                ? "text-slate-900 font-semibold cursor-default"
                : "text-slate-500 hover:text-slate-900 cursor-pointer"
            )}
          >
            {c.icon ?? (i === 0 ? <Folder className="h-3.5 w-3.5" /> : null)}
            <span>{c.label}</span>
          </button>
        </div>
      ))}
    </nav>
  );
}
