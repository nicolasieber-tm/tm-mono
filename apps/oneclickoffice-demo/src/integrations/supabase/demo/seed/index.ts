/* eslint-disable @typescript-eslint/no-explicit-any */
// Seed-Fixtures für den Demo-Modus — coach-taugliche, in sich konsistente Schweizer
// Beispieldaten (feste IDs für stabile Fremdschlüssel). Wird bei jedem Store-Init
// frisch erzeugt; vom Besucher angelegte Daten leben nur bis zum nächsten Reload.

import { DEMO_COMPANY_ID, DEMO_USER_ID } from "../constants";
import { DEMO_RECEIPT_PLACEHOLDER } from "../storage";

const TEMPLATE_ID = "demo-tmpl-0001";

// Mitarbeitende (Demo-User = eingeloggter Coach)
const EMP_DEMO = DEMO_USER_ID;
const EMP_PETRA = "demo-emp-0002";

// Firmen-/Kunden-IDs
const K_PRIV = "demo-kunde-priv";
const K_HELV = "demo-kunde-helv";
const K_ZKB = "demo-kunde-zkb";
const K_MIGR = "demo-kunde-migr";
const K_HUB = "demo-kunde-hub";

function ts(date: string): string {
  return `${date}T08:00:00.000Z`;
}

// Start/Ende passend zur Dauer (nur Anzeige).
const TIME_BY_HOURS: Record<string, [string, string]> = {
  "1": ["09:00", "10:00"],
  "1.5": ["09:00", "10:30"],
  "2": ["09:00", "11:00"],
  "0.5": ["09:00", "09:30"],
};

export function buildSeed(): Record<string, any[]> {
  const unternehmen = [
    {
      id: DEMO_COMPANY_ID,
      company_name: "Coaching Praxis Demo",
      address: "Bahnhofstrasse",
      building_number: "12",
      zip: "8001",
      city: "Zürich",
      country: "CH",
      email: "hallo@coaching-demo.ch",
      phone: "+41 44 123 45 67",
      website: "www.coaching-demo.ch",
      iban: "CH93 0076 2011 6238 5295 7",
      vat_number: "CHE-123.456.789 MWST",
      is_mwst_pflichtig: false,
      logo_url: null,
      client_hierarchy_mode: "two_level",
      client_notes_visibility: "alle_mitarbeiter",
      expense_client_linking_enabled: true,
      expense_line_items_enabled: true,
      banana_export_enabled: false,
      banana_export_granularity: "monatlich",
      banana_default_payment_method: null,
      default_invoice_template_id: TEMPLATE_ID,
      spesen_speicherort: null,
      spesen_hauptordner_id: null,
      user_id: DEMO_USER_ID,
      created_at: ts("2025-01-01"),
      updated_at: ts("2025-01-01"),
    },
  ];

  const employees = [
    {
      id: EMP_DEMO,
      first_name: "Demo",
      last_name: "Coach",
      hourly_rate: 180,
      km_rate: 0.7,
      phone: "+41 79 000 00 01",
      expense_view_preference: "folder",
      unternehmen_id: DEMO_COMPANY_ID,
      created_at: ts("2025-01-01"),
      updated_at: ts("2025-01-01"),
    },
    {
      id: EMP_PETRA,
      first_name: "Petra",
      last_name: "Lang",
      hourly_rate: 160,
      km_rate: 0.7,
      phone: "+41 79 000 00 02",
      expense_view_preference: "folder",
      unternehmen_id: DEMO_COMPANY_ID,
      created_at: ts("2025-01-01"),
      updated_at: ts("2025-01-01"),
    },
  ];

  const kunden = [
    mkKunde(K_PRIV, "Privatklient:innen", "private", "CH93 0076 2011 6238 5295 7"),
    mkKunde(K_HELV, "Helvetia Assurances AG", "business", "CH56 0483 5012 3456 7800 9", {
      contact_person_first_name: "Beat",
      contact_person_last_name: "Estermann",
      address: "Dufourstrasse",
      building_number: "40",
      zip: "9001",
      city: "St. Gallen",
    }),
    mkKunde(K_ZKB, "Zürcher Kantonalbank", "business", "CH21 0070 0110 0012 3456 7", {
      contact_person_first_name: "Nadia",
      contact_person_last_name: "Good",
      address: "Bahnhofstrasse",
      building_number: "9",
      zip: "8001",
      city: "Zürich",
    }),
    mkKunde(K_MIGR, "Migros Genossenschaftsbund", "business", "CH18 0900 0000 8500 1234 5", {
      contact_person_first_name: "Reto",
      contact_person_last_name: "Schär",
      address: "Limmatstrasse",
      building_number: "152",
      zip: "8005",
      city: "Zürich",
    }),
    mkKunde(K_HUB, "Startup Hub Zürich", "business", "CH44 3199 9123 0008 8901 2", {
      contact_person_first_name: "Yara",
      contact_person_last_name: "Brunner",
      address: "Technoparkstrasse",
      building_number: "1",
      zip: "8005",
      city: "Zürich",
    }),
  ];

  // Klienten (Personen) → company_id verweist auf den Kunden/Firma
  const clientDefs: [string, string, string, string, string, string, string][] = [
    // id, first, last, kunde, address, zip, city
    ["demo-cli-01", "Maria", "Keller", K_PRIV, "Seefeldstrasse 21", "8008", "Zürich"],
    ["demo-cli-02", "Jonas", "Brandt", K_HELV, "Dufourstrasse 40", "9001", "St. Gallen"],
    ["demo-cli-03", "Sofia", "Frei", K_PRIV, "Langstrasse 88", "8004", "Zürich"],
    ["demo-cli-04", "Thomas", "Müller", K_ZKB, "Bahnhofstrasse 9", "8001", "Zürich"],
    ["demo-cli-05", "Anna", "Weber", K_MIGR, "Limmatstrasse 152", "8005", "Zürich"],
    ["demo-cli-06", "Lukas", "Meier", K_HUB, "Technoparkstrasse 1", "8005", "Zürich"],
    ["demo-cli-07", "Laura", "Schmid", K_HELV, "Dufourstrasse 40", "9001", "St. Gallen"],
    ["demo-cli-08", "David", "Huber", K_ZKB, "Bahnhofstrasse 9", "8001", "Zürich"],
    ["demo-cli-09", "Sarah", "Brunner", K_PRIV, "Universitätstrasse 5", "8006", "Zürich"],
    ["demo-cli-10", "Michael", "Wyss", K_HUB, "Technoparkstrasse 1", "8005", "Zürich"],
  ];

  const clients = clientDefs.map(([id, first, last, kunde, address, zip, city]) => ({
    id,
    first_name: first,
    last_name: last,
    company_id: kunde,
    unternehmen_id: DEMO_COMPANY_ID,
    salutation: null,
    address,
    zip,
    city,
    birthdate: null,
    notes: null,
    contact_person: null,
    contact_person_first_name: null,
    contact_person_last_name: null,
    contact_person_salutation: null,
    created_at: ts("2025-01-15"),
    updated_at: ts("2025-01-15"),
  }));

  const time_entry_categories = ["Einzelcoaching", "Teamcoaching", "Erstgespräch", "Telefoncoaching"].map(
    (name, i) => ({
      id: `demo-tec-${i + 1}`,
      name,
      unternehmen_id: DEMO_COMPANY_ID,
      created_at: ts("2025-01-01"),
      updated_at: ts("2025-01-01"),
    })
  );

  const expense_categories = [
    ["Reisekosten", "#3B82F6", "car"],
    ["Material", "#16A34A", "package"],
    ["Weiterbildung", "#8B3FD6", "graduation-cap"],
    ["Verpflegung", "#F59E0B", "utensils"],
    ["Raummiete", "#E0457A", "building"],
  ].map(([name, color, icon], i) => ({
    id: `demo-exc-${i + 1}`,
    name,
    color,
    icon,
    is_active: true,
    unternehmen_id: DEMO_COMPANY_ID,
    created_at: ts("2025-01-01"),
    updated_at: ts("2025-01-01"),
  }));

  const invoice_templates = [
    {
      id: TEMPLATE_ID,
      name: "Standard-Vorlage (Demo)",
      file_url: "demo://standard-template",
      html_url: null,
      css_url: null,
      editable_html: null,
      editable_css: null,
      mapping: null,
      deckblatt_enabled: false,
      unternehmen_id: DEMO_COMPANY_ID,
      user_id: DEMO_USER_ID,
      created_at: ts("2025-01-01"),
      updated_at: ts("2025-01-01"),
    },
  ];

  const user_roles = [
    { id: "demo-role-1", user_id: DEMO_USER_ID, role: "admin", created_at: ts("2025-01-01") },
  ];

  // ---- Zeiteinträge (überwiegend offen, damit man Rechnungen generieren kann) ----
  const sessionDescs = [
    "Coaching-Session: Standortbestimmung",
    "Zielklärung & Massnahmenplan",
    "Reflexionsgespräch",
    "Führungscoaching",
    "Konfliktbearbeitung",
    "Umsetzungs-Check",
  ];
  // Für die client_notes-Timeline (gemischte Daten über die Monate).
  const DATES = [
    "2026-06-16", "2026-06-03", "2026-05-21", "2026-05-07", "2026-04-15", "2026-03-11",
    "2026-02-19", "2026-01-13", "2025-11-24", "2025-10-08", "2025-09-16", "2025-06-04",
  ];
  // Jeder Klient hat offene Einträge im AKTUELLEN Monat (Juni 2026, Default-Filter der
  // Rechnungs-Seite) → „Rechnungen generieren" erzeugt mit 1 Klick eine Rechnung pro Klient.
  const JUNE_DAYS = ["2026-06-04", "2026-06-11", "2026-06-18", "2026-06-23"];
  const PAST_DATES = [
    "2026-05-12", "2026-04-08", "2026-03-19", "2026-02-10",
    "2026-01-15", "2025-11-20", "2025-10-07", "2025-09-03",
  ];
  const HOURS = [1, 1.5, 2, 1];

  const time_entries: any[] = [];
  let teId = 1;
  clientDefs.forEach((c, ci) => {
    const [cid, , , kunde] = c;
    // 2 offene Einträge im Juni 2026 + 2 ältere für eine gefüllte Historie.
    const dates = [
      JUNE_DAYS[ci % JUNE_DAYS.length],
      JUNE_DAYS[(ci + 2) % JUNE_DAYS.length],
      PAST_DATES[ci % PAST_DATES.length],
      PAST_DATES[(ci + 4) % PAST_DATES.length],
    ];
    dates.forEach((date, p) => {
      const hours = HOURS[p % HOURS.length];
      const [start, end] = TIME_BY_HOURS[String(hours)] ?? ["09:00", "10:00"];
      time_entries.push({
        id: `demo-te-${teId++}`,
        date,
        start_time: start,
        end_time: end,
        total_hours: hours,
        activity_description: sessionDescs[(ci + p) % sessionDescs.length],
        category: time_entry_categories[(ci + p) % time_entry_categories.length].name,
        company_id: kunde,
        client_id: cid,
        employee_id: ci % 3 === 0 ? EMP_PETRA : EMP_DEMO,
        unternehmen_id: DEMO_COMPANY_ID,
        is_billed: false,
        invoice_id: null,
        internal_notes: null,
        travel_distance_km: ci % 4 === 0 ? 24 : null,
        travel_expense_amount: ci % 4 === 0 ? 16.8 : null,
        travel_from: ci % 4 === 0 ? "Zürich" : null,
        travel_to: ci % 4 === 0 ? "St. Gallen" : null,
        created_at: ts(date),
        updated_at: ts(date),
      });
    });
  });

  // ---- Rechnungen (inkl. zugehöriger, bereits verrechneter Zeiteinträge) ----
  const invoices: any[] = [];
  const pushInvoice = (
    id: string,
    number: string,
    clientId: string,
    kunde: string,
    status: string,
    total: number,
    periodStart: string,
    periodEnd: string,
    billedHours?: { date: string; hours: number; desc: string }[]
  ) => {
    invoices.push({
      id,
      invoice_number: number,
      company_id: kunde,
      client_id: clientId,
      unternehmen_id: DEMO_COMPANY_ID,
      period_start: periodStart,
      period_end: periodEnd,
      status,
      subtotal: total,
      vat_amount: 0,
      total,
      pdf_url: null,
      work_report_url: null,
      created_at: ts(periodEnd),
      updated_at: ts(periodEnd),
    });
    (billedHours ?? []).forEach((b, bi) => {
      const [start, end] = TIME_BY_HOURS[String(b.hours)] ?? ["09:00", "10:00"];
      time_entries.push({
        id: `demo-te-${teId++}`,
        date: b.date,
        start_time: start,
        end_time: end,
        total_hours: b.hours,
        activity_description: b.desc,
        category: "Einzelcoaching",
        company_id: kunde,
        client_id: clientId,
        employee_id: EMP_DEMO,
        unternehmen_id: DEMO_COMPANY_ID,
        is_billed: true,
        invoice_id: id,
        internal_notes: null,
        travel_distance_km: null,
        travel_expense_amount: null,
        travel_from: null,
        travel_to: null,
        created_at: ts(b.date),
        updated_at: ts(b.date),
      });
    });
  };

  pushInvoice("demo-inv-1", "RE-202603-001", "demo-cli-02", K_HELV, "paid", 540, "2026-03-01", "2026-03-31", [
    { date: "2026-03-04", hours: 1, desc: "Coaching-Session" },
    { date: "2026-03-18", hours: 1, desc: "Coaching-Session" },
    { date: "2026-03-25", hours: 1, desc: "Reflexionsgespräch" },
  ]);
  pushInvoice("demo-inv-2", "RE-202604-002", "demo-cli-04", K_ZKB, "sent", 360, "2026-04-01", "2026-04-30", [
    { date: "2026-04-09", hours: 1, desc: "Führungscoaching" },
    { date: "2026-04-23", hours: 1, desc: "Führungscoaching" },
  ]);
  pushInvoice("demo-inv-3", "RE-202602-003", "demo-cli-05", K_MIGR, "paid", 720, "2026-02-01", "2026-02-28");
  pushInvoice("demo-inv-4", "RE-202605-004", "demo-cli-06", K_HUB, "paid", 900, "2026-05-01", "2026-05-31");
  pushInvoice("demo-inv-5", "RE-202605-005", "demo-cli-07", K_HELV, "sent", 450, "2026-05-01", "2026-05-31");
  pushInvoice("demo-inv-6", "RE-202601-006", "demo-cli-01", K_PRIV, "draft", 270, "2026-01-01", "2026-01-31");

  // ---- Spesen (2025 + 2026, mehrere Monate) ----
  const expenseDefs: [string, number, string, string, string | null, string | null][] = [
    // date, amount, category, notes, companyId, clientId
    ["2026-06-10", 48.5, "Reisekosten", "Bahnfahrt St. Gallen", K_HELV, "demo-cli-02"],
    ["2026-06-02", 24.0, "Verpflegung", "Mittagessen mit Klient", K_PRIV, "demo-cli-01"],
    ["2026-05-19", 320.0, "Weiterbildung", "Fachbuch & Seminar", null, null],
    ["2026-05-04", 89.9, "Material", "Coaching-Karten Set", null, null],
    ["2026-04-21", 16.8, "Reisekosten", "Fahrt ZKB Zürich", K_ZKB, "demo-cli-04"],
    ["2026-03-12", 250.0, "Raummiete", "Praxisraum März", null, null],
    ["2026-02-08", 52.4, "Verpflegung", "Teamlunch", K_MIGR, "demo-cli-05"],
    ["2026-01-15", 36.0, "Reisekosten", "Parkgebühren", null, null],
    ["2025-11-20", 250.0, "Raummiete", "Praxisraum November", null, null],
    ["2025-10-05", 145.0, "Weiterbildung", "Online-Kurs", null, null],
    ["2025-09-12", 28.5, "Material", "Flipchart-Papier", null, null],
    ["2025-06-03", 64.0, "Reisekosten", "Bahnfahrt + Tram", K_HUB, "demo-cli-06"],
  ];
  const expenses = expenseDefs.map(([date, amount, category, notes, companyId, clientId], i) => ({
    id: `demo-exp-${i + 1}`,
    expense_date: date,
    amount,
    category,
    notes,
    status: "completed",
    employee_id: i % 3 === 0 ? EMP_PETRA : EMP_DEMO,
    company_id: companyId,
    client_id: clientId,
    unternehmen_id: DEMO_COMPANY_ID,
    receipt_image_url: DEMO_RECEIPT_PLACEHOLDER,
    ai_confidence: 0.95,
    ai_model_used: "demo",
    is_recurring_monthly: false,
    imported_via_bono: false,
    created_at: ts(date),
    updated_at: ts(date),
  }));

  // ---- Sitzungsnotizen (Markdown) für die Klienten-Akte / Timeline ----
  const noteTexts = [
    "## Standortbestimmung\n\nKlient:in beschreibt **Überforderung** im Führungsalltag.\n\n- Hauptthema: Delegation\n- Nächster Schritt: Wochenplanung einführen",
    "## Fortschritt\n\nDelegation klappt besser. Selbstreflexion deutlich gestiegen.\n\n> „Ich muss nicht alles selbst machen.\"",
    "## Zielklärung\n\nNeues Ziel: souveräner Auftritt in Sitzungen. Übung bis zum nächsten Mal vereinbart.",
  ];
  const client_notes: any[] = [];
  let noteId = 1;
  clientDefs.slice(0, 6).forEach((c, ci) => {
    const [cid, , , kunde] = c;
    const count = (ci % 2) + 1;
    for (let n = 0; n < count; n++) {
      const date = DATES[(ci + n) % DATES.length];
      client_notes.push({
        id: `demo-note-${noteId++}`,
        client_id: cid,
        company_id: kunde,
        author_id: DEMO_USER_ID,
        content: noteTexts[(ci + n) % noteTexts.length],
        session_date: date,
        deleted_at: null,
        created_at: ts(date),
        updated_at: ts(date),
      });
    }
  });

  return {
    unternehmen,
    employees,
    kunden,
    clients,
    time_entry_categories,
    expense_categories,
    invoice_templates,
    user_roles,
    time_entries,
    invoices,
    expenses,
    client_notes,
    expense_line_items: [],
    banana_account_mappings: [],
    banana_export_counters: [],
    recurring_expenses: [],
    system_error_log: [],
  };
}

function mkKunde(
  id: string,
  name: string,
  customerType: string,
  iban: string,
  extra: Record<string, any> = {}
) {
  return {
    id,
    name,
    customer_type: customerType,
    iban,
    unternehmen_id: DEMO_COMPANY_ID,
    country: "CH",
    salutation: null,
    contact_person: null,
    contact_person_first_name: null,
    contact_person_last_name: null,
    contact_person_salutation: null,
    email: null,
    phone: null,
    website: null,
    vat_number: null,
    logo_url: null,
    notes: null,
    address: null,
    building_number: null,
    zip: null,
    city: null,
    birthdate: null,
    created_at: ts("2025-01-10"),
    updated_at: ts("2025-01-10"),
    ...extra,
  };
}
