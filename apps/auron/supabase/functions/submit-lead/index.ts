// submit-lead: called from the AURON website after the /Anfrage questions
// are answered. Inserts a row into website_leads and returns the new lead_id
// so the browser can pass it as Cal.com embed metadata.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

type Payload = {
  company_name?: unknown;
  employees?: unknown;
  time_tracking?: unknown;
  erp?: unknown;
  pain_points?: unknown;
  timeline?: unknown;
};

function str(v: unknown, max = 500): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  return s.slice(0, max);
}

function strArr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((x) => x.slice(0, 200));
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const cors = corsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: cors });
  }

  const expected = Deno.env.get("SUBMIT_LEAD_SECRET");
  const provided = req.headers.get("x-auron-secret");
  if (!expected || provided !== expected) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...cors, "content-type": "application/json" },
    });
  }

  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...cors, "content-type": "application/json" },
    });
  }

  const row = {
    company_name: str(body.company_name),
    employees: str(body.employees, 50),
    time_tracking: str(body.time_tracking, 100),
    erp: str(body.erp, 100),
    pain_points: strArr(body.pain_points),
    timeline: str(body.timeline, 100),
    booking_status: "pending" as const,
  };

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "server_misconfigured" }), {
      status: 500,
      headers: { ...cors, "content-type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from("website_leads")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    console.error("insert failed", error);
    return new Response(JSON.stringify({ error: "insert_failed" }), {
      status: 500,
      headers: { ...cors, "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ lead_id: data.id }), {
    status: 200,
    headers: { ...cors, "content-type": "application/json" },
  });
});
