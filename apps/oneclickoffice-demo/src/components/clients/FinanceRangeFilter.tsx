import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  computeRange,
  type DateRange,
  type FinanceRangePreset,
} from "@/utils/entityFinances";

interface Props {
  preset: FinanceRangePreset;
  range: DateRange;
  onChange: (preset: FinanceRangePreset, range: DateRange) => void;
}

const PRESETS: { value: FinanceRangePreset; label: string }[] = [
  { value: "all", label: "Gesamt" },
  { value: "today", label: "Heute" },
  { value: "week", label: "Diese Woche" },
  { value: "month", label: "Dieser Monat" },
  { value: "year", label: "Dieses Jahr" },
  { value: "custom", label: "Eigener Zeitraum" },
];

export const FinanceRangeFilter = ({ preset, range, onChange }: Props) => {
  const handlePreset = (next: FinanceRangePreset) => {
    if (next === "custom") {
      // Custom: vorhandene Range beibehalten (oder offen lassen).
      onChange("custom", range);
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    onChange(next, computeRange(next, today));
  };

  const handleCustom = (key: "from" | "to", value: string) => {
    onChange("custom", { ...range, [key]: value || null });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button
            key={p.value}
            type="button"
            size="sm"
            variant={preset === p.value ? "default" : "outline"}
            onClick={() => handlePreset(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>
      {preset === "custom" && (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            aria-label="Von"
            value={range.from ?? ""}
            onChange={(e) => handleCustom("from", e.target.value)}
            className="w-auto"
          />
          <span className="text-muted-foreground">bis</span>
          <Input
            type="date"
            aria-label="Bis"
            value={range.to ?? ""}
            onChange={(e) => handleCustom("to", e.target.value)}
            className="w-auto"
          />
        </div>
      )}
    </div>
  );
};
