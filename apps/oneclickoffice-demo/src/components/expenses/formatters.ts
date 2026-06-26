/**
 * Formats a number as Swiss CHF with apostrophe thousand-separator
 * and two decimals. Example: 2340.5 → "2'340.50"
 */
export function formatCHF(amount: number): string {
  return amount
    .toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .replace(/,/g, "'");
}

export const MONTH_NAMES_DE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
] as const;

export function monthName(monthOneBased: number): string {
  return MONTH_NAMES_DE[monthOneBased - 1] ?? "";
}

/**
 * Extracts year/month from an ISO date string (YYYY-MM-DD or RFC3339).
 * Returns null for invalid input.
 */
export function parseDateParts(isoDate: string | null | undefined): { year: number; month: number } | null {
  if (!isoDate) return null;
  const match = isoDate.match(/^(\d{4})-(\d{2})/);
  if (!match) return null;
  return { year: parseInt(match[1], 10), month: parseInt(match[2], 10) };
}

/**
 * Formats an ISO date as DD.MM.YYYY for German display.
 */
export function formatDateDE(isoDate: string | null | undefined): string {
  if (!isoDate) return "";
  const parts = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!parts) return isoDate;
  return `${parts[3]}.${parts[2]}.${parts[1]}`;
}
