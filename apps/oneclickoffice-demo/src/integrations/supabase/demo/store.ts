/* eslint-disable @typescript-eslint/no-explicit-any */
// In-Memory-Datenbank für den Demo-Modus.
//
// Reiner Modul-State: existiert nur, solange der Tab lebt. Beim Reload wird das
// Modul neu ausgewertet → Seeds kommen frisch zurück, eigene Einträge sind weg.
// Genau das gewünschte Verhalten („lokal im Browser, weg bei Refresh").

import { DEMO_TABLES } from "./schema";
import { buildSeed } from "./seed";

export type DemoRow = Record<string, any>;

const tables = new Map<string, DemoRow[]>();

function seed() {
  const data = buildSeed();
  tables.clear();
  for (const name of DEMO_TABLES) {
    // Flache Kopie pro Row, damit Mutationen die Seed-Fixtures nicht verändern.
    tables.set(name, (data[name] ?? []).map((row) => ({ ...row })));
  }
}

// Beim ersten Import befüllen.
seed();

/** Liefert die (veränderbare) Row-Liste einer Tabelle. Unbekannte Tabellen → leeres Array. */
export function getTable(name: string): DemoRow[] {
  if (!tables.has(name)) tables.set(name, []);
  return tables.get(name)!;
}

/** Setzt den gesamten Store auf die Seeds zurück (für „Demo neu starten"). */
export function resetStore() {
  seed();
}

/**
 * Wie getTable, löst aber Datenbank-Views dynamisch auf.
 * `unbilled_time_entries` ist in der echten DB eine denormalisierte View über die
 * offenen Zeiteinträge (mit client_name/company_name/hourly_rate/total_cost …).
 */
export function getQueryRows(name: string): DemoRow[] {
  if (name === "unbilled_time_entries") return buildUnbilledView();
  return getTable(name);
}

function buildUnbilledView(): DemoRow[] {
  const clients = getTable("clients");
  const kunden = getTable("kunden");
  const employees = getTable("employees");
  return getTable("time_entries")
    .filter((t) => !t.is_billed)
    .map((t) => {
      const cl = clients.find((c) => c.id === t.client_id);
      const ku = kunden.find((k) => k.id === t.company_id);
      const emp = employees.find((e) => e.id === t.employee_id);
      const hourlyRate = emp?.hourly_rate ?? 0;
      const totalHours = t.total_hours ?? 0;
      const laborCost = hourlyRate * totalHours;
      const travelCost = t.travel_expense_amount ?? 0;
      return {
        ...t,
        client_name: cl ? `${cl.first_name} ${cl.last_name}` : null,
        company_name: ku ? ku.name : null,
        employee_name: emp ? `${emp.first_name} ${emp.last_name}` : null,
        hourly_rate: hourlyRate,
        labor_cost: laborCost,
        travel_cost: travelCost,
        total_cost: laborCost + travelCost,
      };
    });
}
