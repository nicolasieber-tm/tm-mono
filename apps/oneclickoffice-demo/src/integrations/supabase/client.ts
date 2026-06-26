import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { createDemoClient } from './demo';

// Demo-Modus: kein echtes Backend, alle Daten in-memory (siehe ./demo).
const DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

function createRealClient(): SupabaseClient<Database> {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
  }
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

// Im Demo-Modus den In-Memory-Mock verwenden; sonst den echten Supabase-Client.
// Cast auf den echten Client-Typ, damit alle Hooks unverändert typsicher bleiben.
export const supabase: SupabaseClient<Database> = DEMO
  ? (createDemoClient() as SupabaseClient<Database>)
  : createRealClient();
