/* eslint-disable @typescript-eslint/no-explicit-any */
// Minimaler, aber semantisch korrekter Nachbau des Supabase/PostgREST-Query-Builders
// für den Demo-Modus. Deckt genau die in den Hooks verwendeten Operationen ab.
//
// Der Builder ist „thenable": `await supabase.from(t).select().eq()...` löst über
// then() aus und liefert `{ data, error, count }` im selben Format wie supabase-js.

import { getTable, getQueryRows, type DemoRow } from "./store";
import { EMBEDS } from "./schema";

type Filter = {
  op: "eq" | "neq" | "in" | "is" | "gte" | "lte" | "gt" | "lt" | "notnull";
  col: string;
  val: any;
};

const PGRST116 = {
  message: "JSON object requested, multiple (or no) rows returned",
  details: "Results contain 0 rows",
  hint: "",
  code: "PGRST116",
};

function uuid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return "demo-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function compare(a: any, b: any): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1; // nulls last
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

function matches(row: DemoRow, f: Filter): boolean {
  const v = row[f.col];
  switch (f.op) {
    case "eq":
      return v === f.val;
    case "neq":
      return v !== f.val;
    case "in":
      return Array.isArray(f.val) && f.val.includes(v);
    case "is":
      return f.val === null ? v === null || v === undefined : v === f.val;
    case "gte":
      return v != null && v >= f.val;
    case "lte":
      return v != null && v <= f.val;
    case "gt":
      return v != null && v > f.val;
    case "lt":
      return v != null && v < f.val;
    case "notnull":
      return v !== null && v !== undefined;
    default:
      return true;
  }
}

// Aus `*, kunden(name), clients(first_name, last_name)` die Embeds extrahieren.
function parseEmbeds(selectStr: string): { name: string; inner: string }[] {
  const out: { name: string; inner: string }[] = [];
  const re = /(\w+)\s*\(([^)]*)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(selectStr)) !== null) {
    out.push({ name: m[1], inner: m[2].trim() });
  }
  return out;
}

function resolveEmbeds(table: string, row: DemoRow, embeds: { name: string; inner: string }[]): DemoRow {
  if (embeds.length === 0) return { ...row };
  const result: DemoRow = { ...row };
  const defs = EMBEDS[table] ?? {};
  for (const { name, inner } of embeds) {
    const def = defs[name];
    if (!def) continue;
    if (def.kind === "one") {
      const target = getTable(def.target).find((r) => r.id === row[def.localKey]);
      result[name] = target ? project(target, inner) : null;
    } else {
      const children = getTable(def.target).filter((r) => r[def.targetKey] === row.id);
      result[name] = inner === "count" ? [{ count: children.length }] : children.map((c) => project(c, inner));
    }
  }
  return result;
}

function project(row: DemoRow, inner: string): DemoRow {
  if (!inner || inner === "*" || inner === "count") return { ...row };
  const cols = inner.split(",").map((c) => c.trim()).filter(Boolean);
  const out: DemoRow = {};
  for (const c of cols) out[c] = row[c];
  return out;
}

export class DemoQueryBuilder {
  private table: string;
  private op: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private filters: Filter[] = [];
  private selectStr = "*";
  private countMode: string | null = null;
  private headMode = false;
  private orderBy: { col: string; ascending: boolean } | null = null;
  private limitN: number | null = null;
  private singleMode: "single" | "maybe" | null = null;
  private payload: any = null;

  constructor(table: string) {
    this.table = table;
  }

  select(str?: string, opts?: { count?: string; head?: boolean }) {
    if (this.op === "insert" || this.op === "update" || this.op === "upsert" || this.op === "delete") {
      this._selectCalledAfterMutation = true;
    } else {
      this.op = "select";
    }
    this.selectStr = str ?? "*";
    if (opts?.count) this.countMode = opts.count;
    if (opts?.head) this.headMode = true;
    return this;
  }

  insert(data: any) {
    this.op = "insert";
    this.payload = data;
    return this;
  }

  update(data: any) {
    this.op = "update";
    this.payload = data;
    return this;
  }

  upsert(data: any) {
    this.op = "upsert";
    this.payload = data;
    return this;
  }

  delete() {
    this.op = "delete";
    return this;
  }

  eq(col: string, val: any) { this.filters.push({ op: "eq", col, val }); return this; }
  neq(col: string, val: any) { this.filters.push({ op: "neq", col, val }); return this; }
  in(col: string, val: any[]) { this.filters.push({ op: "in", col, val }); return this; }
  is(col: string, val: any) { this.filters.push({ op: "is", col, val }); return this; }
  gte(col: string, val: any) { this.filters.push({ op: "gte", col, val }); return this; }
  lte(col: string, val: any) { this.filters.push({ op: "lte", col, val }); return this; }
  gt(col: string, val: any) { this.filters.push({ op: "gt", col, val }); return this; }
  lt(col: string, val: any) { this.filters.push({ op: "lt", col, val }); return this; }

  // `.not("col", "is", null)` → IS NOT NULL. Andere Negationen werden defensiv ignoriert.
  not(col: string, op: string, val: any) {
    if (op === "is" && val === null) this.filters.push({ op: "notnull", col, val: null });
    return this;
  }

  // `.match({ a: 1, b: 2 })` → mehrere Gleichheitsfilter.
  match(obj: Record<string, any>) {
    for (const [col, val] of Object.entries(obj ?? {})) this.filters.push({ op: "eq", col, val });
    return this;
  }

  // `.contains(col, val)` — Array/JSONB-Enthaltensein. In der Demo selten/unkritisch: no-op.
  contains(_col: string, _val: any) {
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }) {
    this.orderBy = { col, ascending: opts?.ascending ?? true };
    return this;
  }

  limit(n: number) { this.limitN = n; return this; }

  single() { this.singleMode = "single"; return this; }
  maybeSingle() { this.singleMode = "maybe"; return this; }

  private filtered(): DemoRow[] {
    let rows = getQueryRows(this.table);
    for (const f of this.filters) rows = rows.filter((r) => matches(r, f));
    return rows;
  }

  private finalizeSelect(rows: DemoRow[]) {
    const embeds = parseEmbeds(this.selectStr);
    let out = rows.map((r) => resolveEmbeds(this.table, r, embeds));
    if (this.orderBy) {
      const { col, ascending } = this.orderBy;
      out = [...out].sort((a, b) => (ascending ? compare(a[col], b[col]) : -compare(a[col], b[col])));
    }
    if (this.limitN != null) out = out.slice(0, this.limitN);
    return out;
  }

  private wrapSingle(rows: DemoRow[]) {
    if (this.singleMode === "single") {
      if (rows.length === 1) return { data: rows[0], error: null };
      return { data: null, error: { ...PGRST116 } };
    }
    if (this.singleMode === "maybe") {
      return { data: rows.length > 0 ? rows[0] : null, error: null };
    }
    return { data: rows, error: null };
  }

  private exec(): { data: any; error: any; count?: number | null } {
    try {
      const store = getTable(this.table);

      if (this.op === "select") {
        const base = this.filtered();
        if (this.headMode || this.countMode) {
          return { data: this.headMode ? null : this.finalizeSelect(base), error: null, count: base.length };
        }
        const out = this.finalizeSelect(base);
        return { ...this.wrapSingle(out), count: null };
      }

      if (this.op === "insert" || this.op === "upsert") {
        const items: DemoRow[] = Array.isArray(this.payload) ? this.payload : [this.payload];
        const inserted: DemoRow[] = [];
        for (const item of items) {
          const existingIdx = this.op === "upsert" && item.id ? store.findIndex((r) => r.id === item.id) : -1;
          if (existingIdx >= 0) {
            Object.assign(store[existingIdx], item, { updated_at: nowIso() });
            inserted.push(store[existingIdx]);
          } else {
            const row: DemoRow = {
              id: item.id ?? uuid(),
              created_at: item.created_at ?? nowIso(),
              updated_at: item.updated_at ?? nowIso(),
              ...item,
            };
            store.push(row);
            inserted.push(row);
          }
        }
        if (this.selectStr && (this.singleMode || this.selectExplicit)) {
          const out = inserted.map((r) => resolveEmbeds(this.table, r, parseEmbeds(this.selectStr)));
          return { ...this.wrapSingle(out), count: null };
        }
        return { data: null, error: null };
      }

      if (this.op === "update") {
        const targets = this.filtered();
        for (const row of targets) Object.assign(row, this.payload, { updated_at: nowIso() });
        if (this.selectExplicit || this.singleMode) {
          const out = targets.map((r) => resolveEmbeds(this.table, r, parseEmbeds(this.selectStr)));
          return { ...this.wrapSingle(out), count: null };
        }
        return { data: null, error: null };
      }

      if (this.op === "delete") {
        const targets = this.filtered();
        const ids = new Set(targets.map((r) => r.id));
        const remaining = store.filter((r) => !ids.has(r.id));
        store.length = 0;
        store.push(...remaining);
        if (this.selectExplicit || this.singleMode) {
          return { ...this.wrapSingle(targets), count: null };
        }
        return { data: null, error: null };
      }

      return { data: null, error: null };
    } catch (e: any) {
      return { data: null, error: { message: String(e?.message ?? e), code: "DEMO_ERR" } };
    }
  }

  // Wurde select() nach einer Mutation explizit aufgerufen?
  private _selectCalledAfterMutation = false;
  private get selectExplicit(): boolean {
    return this._selectCalledAfterMutation;
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.exec()).then(onfulfilled, onrejected);
  }
}
