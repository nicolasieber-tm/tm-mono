import { useRef, useState, useLayoutEffect } from "react";
import { cn } from "@/lib/utils";
import { Folder, List } from "lucide-react";
import type { ViewMode } from "./types";

type Props = {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
};

const tabs: { value: ViewMode; label: string; icon: typeof Folder }[] = [
  { value: "ordner", label: "Ordner", icon: Folder },
  { value: "liste", label: "Liste", icon: List },
];

/**
 * Animated slide-toggle for the Spesen view mode.
 * A rounded white pill slides smoothly between the two tabs using CSS
 * transitions on left/width, measured via refs against the active tab.
 */
export function ViewModeToggle({ value, onChange }: Props) {
  const tabRefs = useRef<Record<ViewMode, HTMLButtonElement | null>>({
    ordner: null,
    liste: null,
  });
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false });

  useLayoutEffect(() => {
    const activeTab = tabRefs.current[value];
    if (activeTab) {
      setPill({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
        ready: true,
      });
    }
  }, [value]);

  return (
    <div
      role="group"
      aria-label="Ansichtsmodus"
      className="relative inline-flex items-center bg-slate-100 rounded-full p-1 border border-slate-200"
    >
      <div
        aria-hidden="true"
        className={cn(
          "absolute top-1 bottom-1 rounded-full bg-white shadow-sm transition-all duration-300 ease-out",
          pill.ready ? "opacity-100" : "opacity-0"
        )}
        style={{
          left: pill.left,
          width: pill.width,
        }}
      />
      {tabs.map(({ value: tabValue, label, icon: Icon }) => {
        const isActive = value === tabValue;
        return (
          <button
            key={tabValue}
            ref={(el) => {
              tabRefs.current[tabValue] = el;
            }}
            type="button"
            onClick={() => onChange(tabValue)}
            aria-pressed={isActive}
            className={cn(
              "relative z-10 flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200",
              isActive
                ? "text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
