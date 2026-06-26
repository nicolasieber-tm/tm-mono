import type { Expense } from "./types";
import { cn } from "@/lib/utils";

type BadgeConfig = {
  text: string;
  bg: string;       // Tailwind background class
  color: string;    // Tailwind text color class
};

function getBadges(expense: Expense): BadgeConfig[] {
  const badges: BadgeConfig[] = [];

  // Source badge: Automatisch (AI extraction OR legacy n8n/Bono) vs Manual
  if (expense.ai_model_used || expense.imported_via_bono) {
    badges.push({ text: "🤖 Automatisch", bg: "bg-violet-100/90", color: "text-violet-700" });
  } else {
    badges.push({ text: "✍️ Manuell", bg: "bg-slate-100/90", color: "text-slate-600" });
  }

  const freq = expense.recurrence_frequency;
  if (freq === "monthly" || expense.is_recurring_monthly) {
    badges.push({ text: "🔁 Monatlich", bg: "bg-blue-100/90", color: "text-blue-700" });
  } else if (freq === "weekly") {
    badges.push({ text: "🔁 Wöchentlich", bg: "bg-blue-100/90", color: "text-blue-700" });
  }

  if (expense.status === "processing") {
    badges.push({ text: "⏳ Wird analysiert…", bg: "bg-amber-100/90", color: "text-amber-700" });
  } else if (expense.status === "failed") {
    badges.push({ text: "⚠️ Fehler", bg: "bg-red-100/90", color: "text-red-700" });
  }

  return badges;
}

type Props = {
  expense: Expense;
  className?: string;
  size?: "sm" | "md";
};

export function ExpenseBadges({ expense, className, size = "sm" }: Props) {
  const badges = getBadges(expense);
  const sizeClass =
    size === "sm" ? "text-[9px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {badges.map((b, i) => (
        <div
          key={i}
          className={cn(
            "rounded-full font-bold backdrop-blur-sm",
            sizeClass,
            b.bg,
            b.color
          )}
        >
          {b.text}
        </div>
      ))}
    </div>
  );
}
