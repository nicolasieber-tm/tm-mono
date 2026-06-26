import type { ClientHierarchyMode } from "@/hooks/useClientHierarchyMode";

export function getEntityLabel(mode: ClientHierarchyMode): {
  singular: string;
  plural: string;
} {
  if (mode === "single_level") {
    return { singular: "Kunde", plural: "Kunden" };
  }
  return { singular: "Klient", plural: "Klienten" };
}
