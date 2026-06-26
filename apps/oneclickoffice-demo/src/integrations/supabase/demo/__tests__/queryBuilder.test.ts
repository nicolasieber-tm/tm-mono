import { describe, it, expect, beforeEach } from "vitest";
import { DemoQueryBuilder } from "../queryBuilder";
import { resetStore } from "../store";
import { DEMO_COMPANY_ID } from "../constants";

const from = (t: string) => new DemoQueryBuilder(t);

describe("Demo QueryBuilder", () => {
  beforeEach(() => resetStore());

  it("liest clients mit eingebettetem kunden(name)", async () => {
    const { data, error } = await from("clients")
      .select("*, kunden(name)")
      .eq("unternehmen_id", DEMO_COMPANY_ID)
      .order("last_name");
    expect(error).toBeNull();
    expect((data as any[]).length).toBe(10);
    expect((data as any[])[0].kunden).toHaveProperty("name");
    // order by last_name: Brandt zuerst
    expect((data as any[])[0].last_name).toBe("Brandt");
  });

  it("löst clients(count) als Reverse-Aggregat auf", async () => {
    const { data } = await from("kunden")
      .select("*, clients(count)")
      .eq("unternehmen_id", DEMO_COMPANY_ID)
      .order("name");
    expect((data as any[]).length).toBe(5);
    const priv = (data as any[]).find((k) => k.id === "demo-kunde-priv");
    expect(priv.clients[0].count).toBe(3); // Maria, Sofia, Sarah
  });

  it("insert legt Zeile an und vergibt id", async () => {
    const { data: created, error } = await from("clients")
      .insert({ first_name: "Test", last_name: "Person", company_id: "demo-kunde-priv", unternehmen_id: DEMO_COMPANY_ID })
      .select()
      .single();
    expect(error).toBeNull();
    expect((created as any).id).toBeTruthy();
    const { data } = await from("clients").select("*").eq("unternehmen_id", DEMO_COMPANY_ID);
    expect((data as any[]).length).toBe(11);
  });

  it("single() ohne Treffer → PGRST116", async () => {
    const { data, error } = await from("clients").select("*").eq("id", "nope").single();
    expect(data).toBeNull();
    expect((error as any)?.code).toBe("PGRST116");
  });

  it("maybeSingle() ohne Treffer → null, kein Fehler", async () => {
    const { data, error } = await from("clients").select("*").eq("id", "nope").maybeSingle();
    expect(data).toBeNull();
    expect(error).toBeNull();
  });

  it("update + delete wirken auf den Store", async () => {
    await from("clients").update({ first_name: "Geändert" }).eq("id", "demo-cli-01").select().single();
    const { data } = await from("clients").select("*").eq("id", "demo-cli-01").single();
    expect((data as any).first_name).toBe("Geändert");

    await from("clients").delete().eq("id", "demo-cli-01");
    const { data: after } = await from("clients").select("*").eq("id", "demo-cli-01").maybeSingle();
    expect(after).toBeNull();
  });

  it("filtert offene Zeiteinträge (.is/.eq) und Soft-Delete-Notizen", async () => {
    const { data: te } = await from("time_entries")
      .select("*")
      .eq("unternehmen_id", DEMO_COMPANY_ID)
      .eq("is_billed", false);
    expect((te as any[]).length).toBeGreaterThan(0);
    expect((te as any[]).every((t) => t.is_billed === false)).toBe(true);

    const { data: notes } = await from("client_notes").select("*").is("deleted_at", null);
    expect((notes as any[]).length).toBeGreaterThan(0);
  });

  it("Auth-unabhängiger Reverse-Join für unbezahlte Rechnungen via .in()", async () => {
    const ids = ["demo-cli-01", "demo-cli-02"];
    const { data } = await from("time_entries").select("*").in("client_id", ids);
    expect((data as any[]).every((t) => ids.includes(t.client_id))).toBe(true);
  });

  it("View unbilled_time_entries: nur offene Einträge, denormalisiert", async () => {
    const { data } = await from("unbilled_time_entries").select("*").eq("unternehmen_id", DEMO_COMPANY_ID);
    const rows = data as any[];
    expect(rows.length).toBeGreaterThan(0);
    // Jeder Klient hat 2 Juni-Einträge -> mind. 20 offene
    expect(rows.length).toBeGreaterThanOrEqual(20);
    expect(rows.every((r) => r.is_billed === false)).toBe(true);
    // Denormalisierte Felder vorhanden
    expect(rows[0]).toHaveProperty("client_name");
    expect(rows[0]).toHaveProperty("company_name");
    expect(rows[0]).toHaveProperty("total_cost");
    expect(typeof rows[0].total_cost).toBe("number");
  });

  it(".not(invoice_id, is, null) liefert nur verrechnete Einträge", async () => {
    const { data } = await from("time_entries")
      .select("invoice_id, employee_id")
      .eq("unternehmen_id", DEMO_COMPANY_ID)
      .eq("is_billed", true)
      .not("invoice_id", "is", null);
    const rows = data as any[];
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.invoice_id != null)).toBe(true);
  });

  it("Generierung markiert offene Einträge als verrechnet (Wow-Flow)", async () => {
    const before = (await from("unbilled_time_entries").select("*").eq("unternehmen_id", DEMO_COMPANY_ID)).data as any[];
    const ids = before.map((r) => r.id);
    await from("time_entries").update({ is_billed: true, invoice_id: "demo-inv-x" }).in("id", ids);
    const after = (await from("unbilled_time_entries").select("*").eq("unternehmen_id", DEMO_COMPANY_ID)).data as any[];
    expect(after.length).toBe(0);
  });
});
