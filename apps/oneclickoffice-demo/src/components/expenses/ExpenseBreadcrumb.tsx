import type { NavigationPath } from "./types";
import { monthName } from "./formatters";
import { cn } from "@/lib/utils";
import { ChevronRight, Folder } from "lucide-react";

type Crumb = {
  label: string;
  onClick?: () => void;
  active?: boolean;
  icon?: React.ReactNode;
};

type Props = {
  path: NavigationPath;
  onNavigate: (path: NavigationPath) => void;
  categoryIcon?: string | null;
  categoryLabel?: string | null;
};

export function ExpenseBreadcrumb({ path, onNavigate, categoryIcon, categoryLabel }: Props) {
  const crumbs: Crumb[] = [];

  crumbs.push({
    label: "Alle Jahre",
    icon: <Folder className="h-3.5 w-3.5" />,
    onClick: () => onNavigate({ year: null, month: null, category: null }),
    active: path.year == null,
  });

  if (path.year != null) {
    crumbs.push({
      label: String(path.year),
      onClick: () => onNavigate({ year: path.year, month: null, category: null }),
      active: path.month == null,
    });
  }

  if (path.year != null && path.month != null) {
    crumbs.push({
      label: monthName(path.month),
      onClick: () => onNavigate({ year: path.year, month: path.month, category: null }),
      active: path.category == null,
    });
  }

  if (path.category != null) {
    const label = categoryLabel ?? path.category;
    crumbs.push({
      label: categoryIcon ? `${categoryIcon} ${label}` : label,
      active: true,
    });
  }

  return (
    <nav className="flex items-center gap-2 text-[13px] overflow-x-auto scrollbar-hide min-w-0">
      {crumbs.map((c, i) => (
        <div key={i} className="flex items-center gap-2 shrink-0">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
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
            {c.icon}
            <span>{c.label}</span>
          </button>
        </div>
      ))}
    </nav>
  );
}
