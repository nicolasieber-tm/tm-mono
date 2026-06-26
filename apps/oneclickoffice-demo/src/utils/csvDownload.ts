/**
 * Gemeinsame CSV-Helfer für alle clientseitigen Exporte.
 * Geteilt zwischen Spesen-Export (csvExport.ts) und Finanz-Export
 * (financeExport.ts), damit Escaping und Download-Mechanik nur einmal
 * existieren.
 */

/** Maskiert Werte für ein Semikolon-getrenntes CSV. */
export function csvEscape(value: string | number | null | undefined): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",;\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Baut ein BOM-CSV-Blob und löst den Browser-Download aus. */
export function triggerCsvDownload(csv: string, filename: string): void {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
