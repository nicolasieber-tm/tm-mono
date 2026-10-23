// Rückruf-Anfrage von trendingmedia.ch (Formular „Rückruf anfordern", z. B. /handwerk).
//
// Ablauf: Website → hier (mit anon-Key als Bearer) → public.rueckruf_anfordern()
// mit Service-Role (legt den Kontakt in der Orbit-Pipeline an bzw. ergänzt ihn)
// → Telegram-Nachricht an denselben Chat wie bei neuen Leads.
//
// Die DB-Funktion ist nur für service_role ausführbar; die Website kann also
// nur über diese Function schreiben. Ein verstecktes Feld (`website`) fängt
// einfache Bots ab: ist es gefüllt, antworten wir „ok", speichern aber nichts.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID") ?? "";

const ALLOWED_ORIGINS = [/^https:\/\/(www\.)?trendingmedia\.ch$/, /^https:\/\/[a-z0-9-]+\.up\.railway\.app$/, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/];

const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && ALLOWED_ORIGINS.some((r) => r.test(origin)) ? origin : "https://trendingmedia.ch",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  Vary: "Origin",
});

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = { ...cors(origin), "Content-Type": "application/json" };
  const json = (status: number, data: unknown) => new Response(JSON.stringify(data), { status, headers });

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json(405, { error: "method not allowed" });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* leer */ }

  if (str(body.website, 200)) return json(200, { ok: true }); // Honeypot

  const name = str(body.name, 120);
  const betrieb = str(body.betrieb, 160);
  const telefon = str(body.telefon, 40);
  const seite = str(body.seite, 200);
  const utm = body.utm && typeof body.utm === "object" && !Array.isArray(body.utm) ? body.utm : {};
  const digits = telefon.replace(/\D/g, "");
  if (name.length < 2 || betrieb.length < 2 || digits.length < 9 || digits.length > 15) {
    return json(400, { error: "ungueltige_eingabe" });
  }

  const rpc = await fetch(`${SUPABASE_URL}/rest/v1/rpc/rueckruf_anfordern`, {
    method: "POST",
    headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_name: name, p_betrieb: betrieb, p_telefon: telefon, p_seite: seite, p_utm: utm }),
  });
  if (!rpc.ok) {
    const detail = await rpc.text();
    console.error("rueckruf_anfordern fehlgeschlagen:", rpc.status, detail);
    return json(rpc.status === 400 ? 400 : 500, { error: detail.includes("zu_viele") ? "zu_viele_anfragen" : "fehler" });
  }
  const status = (await rpc.json()) as string; // "neu" | "bestehend" | "doppelt"
  if (status === "doppelt") return json(200, { ok: true });

  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    const kampagne = (utm as Record<string, unknown>).utm_campaign;
    const lines = [
      "📞 Rückruf angefordert — trendingmedia.ch",
      "",
      `👤 ${name}`,
      `🏢 ${betrieb}`,
      `📞 ${telefon}`,
      "",
      `🔗 Seite: ${seite || "—"}${kampagne ? ` · Kampagne: ${kampagne}` : ""}`,
      status === "neu" ? "🆕 Neu in der Pipeline (zuständig: Nicola)" : "↩️ Kontakt existierte schon, Follow-up auf heute gesetzt",
    ];
    const tg = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: lines.join("\n") }),
    });
    if (!tg.ok) console.error("Telegram fehlgeschlagen:", tg.status, await tg.text());
  }

  return json(200, { ok: true });
});
