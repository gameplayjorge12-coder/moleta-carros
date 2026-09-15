import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Cliente Supabase — Server ou Client
// fetch com cache 'no-store': o estoque muda pelo admin, precisa sempre fresco.
// Evita o Data Cache do Next.js servir resultado vazio antigo.
export function getSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          fetch(input, { ...init, cache: 'no-store' }),
      },
    }
  );
}

// Aliases
export const createBrowserSupabaseClient = getSupabaseClient;
export const createServerSupabaseClient = getSupabaseClient;
