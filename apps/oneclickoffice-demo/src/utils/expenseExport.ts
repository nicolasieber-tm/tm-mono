import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Database } from "@/integrations/supabase/types";

export type ExpenseWithRelations = Database["public"]["Tables"]["expenses"]["Row"] & {
  kunden?: { name?: string | null } | null;
  companies?: { name?: string | null } | null;
  clients?: { first_name?: string | null; last_name?: string | null } | null;
  employees?: { first_name?: string | null; last_name?: string | null } | null;
};

interface ExportOptions {
  monthFilter?: string;
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("de-CH");
};

const formatCurrency = (amount: number) => {
  return `CHF ${amount.toFixed(2)}`;
};

const getMonthLabel = (month?: string) => {
  if (!month) return "Alle Spesen";
  const [year, monthValue] = month.split("-");
  const date = new Date(Number(year), Number(monthValue) - 1, 1);
  return date.toLocaleDateString("de-CH", { month: "long", year: "numeric" });
};

const getEmployeeName = (expense: ExpenseWithRelations) => {
  const employee = expense.employees;
  if (employee?.first_name || employee?.last_name) {
    return `${employee.first_name || ""} ${employee.last_name || ""}`.trim();
  }
  return "-";
};

const getCompanyName = (expense: ExpenseWithRelations) => {
  const company = expense.kunden || expense.companies;
  if (company?.name) return company.name;
  return "-";
};

export const buildExpenseExportFilename = (
  monthFilter?: string,
  extension: "pdf" | "csv" = "pdf"
) => {
  const today = new Date().toISOString().split("T")[0];
  const monthSlug = monthFilter || "alle";
  return `spesen-${monthSlug}-${today}.${extension}`;
};

export function generateExpensesPdf(
  expenses: ExpenseWithRelations[],
  options: ExportOptions = {}
) {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  const totalAmount = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Spesen-Export", 14, 16);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const subtitle = [
    getMonthLabel(options.monthFilter),
    `Anzahl: ${expenses.length}`,
    `Total: ${formatCurrency(totalAmount)}`,
  ].join(" • ");
  doc.text(subtitle, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [["Datum", "Mitarbeiter", "Firma", "Kategorie", "Betrag", "Notizen"]],
    body: expenses.map((expense) => [
      formatDate(expense.expense_date),
      getEmployeeName(expense),
      getCompanyName(expense),
      expense.category || "-",
      formatCurrency(Number(expense.amount || 0)),
      expense.notes || "-",
    ]),
    styles: { fontSize: 9, cellPadding: 2 },
    margin: { left: 12, right: 12 },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 26 },
      4: { cellWidth: 22, halign: "right" },
      5: { cellWidth: 56 },
    },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
  });

  const filename = buildExpenseExportFilename(options.monthFilter, "pdf");
  doc.save(filename);
  return filename;
}

const escapeCsvValue = (value: string) => {
  if (!value) return "";
  const sanitized = value.replace(/\r?\n/g, " ");
  const needsQuoting = /[;"\n,]/.test(sanitized);
  if (needsQuoting) {
    return `"${sanitized.replace(/"/g, '""')}"`;
  }
  return sanitized;
};

export function generateExpensesCsv(
  expenses: ExpenseWithRelations[],
  options: ExportOptions = {}
) {
  const header = ["Datum", "Mitarbeiter", "Firma", "Kategorie", "Betrag", "Notizen"];
  const rows = expenses.map((expense) => [
    formatDate(expense.expense_date),
    getEmployeeName(expense),
    getCompanyName(expense),
    expense.category || "-",
    formatCurrency(Number(expense.amount || 0)),
    expense.notes || "-",
  ]);

  const delimiter = ";";
  const csvContent = [header, ...rows]
    .map((row) => row.map((value) => escapeCsvValue(String(value ?? ""))).join(delimiter))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const filename = buildExpenseExportFilename(options.monthFilter, "csv");

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);

  return filename;
}
