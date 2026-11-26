import { SUPABASE_ANON_KEY, SUPABASE_URL, utmParams } from "@/lib/track";

/* Aufrufe an die Edge Function `kurs` (Supabase-Projekt Orbit).
   Quelltext: apps/tm/supabase/functions/kurs/ */

const ENDPOINT = `${SUPABASE_URL}/functions/v1/kurs`;

async function call<T>(body: Record<string, unknown>, keepalive = false): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    body: JSON.stringify(body),
    keepalive,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(String(res.status)), { status: res.status, data });
  return data as T;
}

export type AnmeldungAntwort = { ok: true; token?: string };

export function anmelden(f: { name: string; email: string; firma: string; branche?: string; website?: string }) {
  return call<AnmeldungAntwort>({
    action: "anmelden",
    ...f,
    seite: window.location.pathname,
    referrer: document.referrer ? document.referrer.slice(0, 300) : undefined,
    utm: utmParams(),
  });
}

export type KursEvent = "besuch" | "lektion" | "video_start" | "video_ende" | "rechner" | "aufgaben" | "check_klick" | "abmelden";

export type Teilnehmer = {
  ok: boolean;
  name?: string;
  email?: string;
  firma?: string;
  aufgaben?: string[];
  lektionen?: number[];
  abgemeldet?: boolean;
};

export function kursEvent(token: string, event: KursEvent, lektion?: number, meta: Record<string, unknown> = {}) {
  return call<Teilnehmer>({ action: "event", token, event, lektion, meta }, event !== "aufgaben");
}
