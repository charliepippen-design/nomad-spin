// Browser Supabase client.
// Accepts either the legacy anon key or the newer publishable key.
// Missing or invalid config must not throw: Playwright builds the production
// bundle without those GitHub secrets, and createClient() throws
// "supabaseKey is required." which unmounted the whole SPA (empty <body>).
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'public-anon-key';

function createSupabaseClient(): { client: SupabaseClient<Database>; configured: boolean } {
  const url = SUPABASE_URL?.trim() ?? '';
  const key = SUPABASE_ANON_KEY?.trim() ?? '';

  if (url && key) {
    try {
      return {
        configured: true,
        client: createClient<Database>(url, key, {
          auth: {
            storage: localStorage,
            persistSession: true,
            autoRefreshToken: true,
          },
        }),
      };
    } catch (error) {
      console.warn('[supabase] Invalid project config; auth and live data are disabled.', error);
    }
  } else {
    console.warn(
      '[supabase] Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY) to enable auth and live data.',
    );
  }

  return {
    configured: false,
    client: createClient<Database>(PLACEHOLDER_URL, PLACEHOLDER_KEY, {
      auth: {
        storage: localStorage,
        persistSession: false,
        autoRefreshToken: false,
      },
    }),
  };
}

const supabaseClient = createSupabaseClient();

export const supabase = supabaseClient.client;
/** False when env is missing or createClient rejected the config. Live queries must not call the placeholder host. */
export const isSupabaseConfigured = supabaseClient.configured;
