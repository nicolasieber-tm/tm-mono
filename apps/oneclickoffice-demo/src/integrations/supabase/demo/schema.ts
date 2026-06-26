// Auflösung der eingebetteten Relations (PostgREST-Embeds), die in den Hooks
// tatsächlich vorkommen, z. B. `select('*, kunden(name), clients(first_name, last_name)')`.
//
// kind 'one'  → Forward-FK: row[localKey] === target.id  → liefert ein Objekt (oder null)
// kind 'many' → Reverse:    target.row[targetKey] === row.id → liefert ein Array
//               (Sonderfall `(count)` liefert [{ count: N }])

export type EmbedDef =
  | { kind: "one"; localKey: string; target: string }
  | { kind: "many"; target: string; targetKey: string };

export const EMBEDS: Record<string, Record<string, EmbedDef>> = {
  clients: {
    kunden: { kind: "one", localKey: "company_id", target: "kunden" },
  },
  kunden: {
    clients: { kind: "many", target: "clients", targetKey: "company_id" },
  },
  invoices: {
    kunden: { kind: "one", localKey: "company_id", target: "kunden" },
    clients: { kind: "one", localKey: "client_id", target: "clients" },
  },
  time_entries: {
    kunden: { kind: "one", localKey: "company_id", target: "kunden" },
    clients: { kind: "one", localKey: "client_id", target: "clients" },
    employees: { kind: "one", localKey: "employee_id", target: "employees" },
    invoices: { kind: "one", localKey: "invoice_id", target: "invoices" },
  },
  expenses: {
    kunden: { kind: "one", localKey: "company_id", target: "kunden" },
    clients: { kind: "one", localKey: "client_id", target: "clients" },
    employees: { kind: "one", localKey: "employee_id", target: "employees" },
  },
  system_error_log: {
    unternehmen: { kind: "one", localKey: "unternehmen_id", target: "unternehmen" },
  },
};

// Tabellen, die im Mock geführt werden. Reihenfolge irrelevant.
export const DEMO_TABLES = [
  "unternehmen",
  "kunden",
  "clients",
  "employees",
  "time_entries",
  "time_entry_categories",
  "expenses",
  "expense_categories",
  "expense_line_items",
  "invoices",
  "invoice_templates",
  "client_notes",
  "user_roles",
  "system_error_log",
  "banana_account_mappings",
  "banana_export_counters",
  "recurring_expenses",
] as const;

export type DemoTable = (typeof DEMO_TABLES)[number];
