import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Cliente Supabase — Server ou Client
export function getSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Aliases
export const createBrowserSupabaseClient = getSupabaseClient;
export const createServerSupabaseClient = getSupabaseClient;
