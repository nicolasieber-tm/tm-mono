import { Database } from "@/integrations/supabase/types";

export type Salutation = Database["public"]["Enums"]["salutation_t"];

export const SALUTATION_NONE_VALUE = "__none__";

const SALUTATIONS: readonly Salutation[] = ["Herr", "Frau", "Divers"];

export function formatSalutationLetter(value: unknown): string {
  switch (value) {
    case "Herr":
      return "Sehr geehrter Herr";
    case "Frau":
      return "Sehr geehrte Frau";
    case "Divers":
      return "Guten Tag";
    default:
      return "";
  }
}

export function formatFormalSalutation(value: unknown, lastName: unknown): string {
  const normalizedLastName = typeof lastName === "string" ? lastName.trim() : "";
  switch (value) {
    case "Herr":
      return ["Sehr geehrter Herr", normalizedLastName].filter(Boolean).join(" ");
    case "Frau":
      return ["Sehr geehrte Frau", normalizedLastName].filter(Boolean).join(" ");
    case "Divers":
      return "Guten Tag";
    default:
      return "Guten Tag";
  }
}

export function normalizeSalutationInput(value: unknown): Salutation | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === SALUTATION_NONE_VALUE) return null;
  return SALUTATIONS.includes(trimmed as Salutation) ? (trimmed as Salutation) : null;
}
