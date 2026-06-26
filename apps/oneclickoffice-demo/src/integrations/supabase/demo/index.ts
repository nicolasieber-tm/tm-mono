/* eslint-disable @typescript-eslint/no-explicit-any */
// Zusammensetzung des Demo-Supabase-Clients. Bietet dieselbe Oberfläche wie supabase-js,
// soweit von der App genutzt: from / auth / storage / functions / rpc / channel.

import { DemoQueryBuilder } from "./queryBuilder";
import { demoAuth } from "./auth";
import { demoStorage } from "./storage";
import { demoFunctions, demoRpc, demoChannel } from "./functions";
import { resetStore } from "./store";
// Registriert den generate-invoice-pdf-Vorschau-Handler (Seiteneffekt-Import).
import "./invoicePreview";

export function createDemoClient(): any {
  return {
    from: (table: string) => new DemoQueryBuilder(table),
    auth: demoAuth,
    storage: demoStorage,
    functions: demoFunctions,
    rpc: (name: string, params?: any) => demoRpc(name, params),
    channel: (name: string) => demoChannel(name),
    removeChannel: () => Promise.resolve({ error: null }),
    removeAllChannels: () => Promise.resolve({ error: null }),
    getChannels: () => [],
  };
}

export { resetStore };
