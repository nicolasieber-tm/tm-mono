/* eslint-disable @typescript-eslint/no-explicit-any */
// Edge-Function- und RPC-Stubs für den Demo-Modus.
//
// Handler werden über eine Registry eingehängt, damit z. B. der Rechnungs-Vorschau-
// Handler (generate-invoice-pdf) ohne Zirkel-Import nachträglich registriert werden kann.

import { getTable } from "./store";

type FnHandler = (body: any) => Promise<{ data: any; error: any }> | { data: any; error: any };

const handlers = new Map<string, FnHandler>();

export function setDemoFunctionHandler(name: string, handler: FnHandler) {
  handlers.set(name, handler);
}

export const demoFunctions = {
  async invoke(name: string, opts?: { body?: any }) {
    const handler = handlers.get(name);
    if (handler) return handler(opts?.body);
    // Unbekannte Funktionen im Demo: stillschweigend erfolgreich (kein echter Effekt).
    return { data: null, error: null };
  },
};

export async function demoRpc(name: string, params?: any) {
  if (name === "reset_banana_mapping") {
    const rows = getTable("banana_account_mappings");
    const remaining = rows.filter(
      (r) => !(r.unternehmen_id === params?.p_unternehmen_id && r.category_key === params?.p_category_key)
    );
    rows.length = 0;
    rows.push(...remaining);
    return { data: null, error: null };
  }
  return { data: null, error: null };
}

// Realtime-Kanal-Stub (z. B. Spesen-OCR-Updates) — tut nichts, crasht aber nicht.
export function demoChannel(_name: string) {
  const channel: any = {
    on() {
      return channel;
    },
    subscribe(cb?: (status: string) => void) {
      if (cb) Promise.resolve().then(() => cb("SUBSCRIBED"));
      return channel;
    },
    unsubscribe() {
      return Promise.resolve({ error: null });
    },
  };
  return channel;
}
