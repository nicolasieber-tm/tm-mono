import type { Database } from "@/integrations/supabase/types";

export type Expense = Database["public"]["Tables"]["expenses"]["Row"] & {
  kunden?: { name: string | null } | null;
  clients?: { first_name: string | null; last_name: string | null } | null;
  employees?: { first_name: string | null; last_name: string | null } | null;
};

export type ExpenseCategory = Database["public"]["Tables"]["expense_categories"]["Row"];

export type ViewMode = "ordner" | "liste";
export type LeafStyle = "summary" | "gallery";

export type NavigationPath = {
  year: number | null;
  month: number | null;   // 1..12
  category: string | null; // category name, or "__uncategorized__" pseudo key
};

export type FolderSummary = {
  key: string;       // stable key for React (e.g. "2026", "2026-03", "2026-03-Reise")
  label: string;     // human label for display
  count: number;
  total: number;
  isCurrent?: boolean;
};

export type YearFolder = FolderSummary & { year: number };
export type MonthFolder = FolderSummary & { year: number; month: number };
export type CategoryFolder = FolderSummary & {
  categoryName: string;
  icon: string | null;
  color: string | null;
  isUncategorized: boolean;
};

export const UNCATEGORIZED_KEY = "__uncategorized__";
export const UNCATEGORIZED_LABEL = "Nicht kategorisiert";
