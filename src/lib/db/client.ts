import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let serverClient: SupabaseClient | null = null;

/**
 * Server-side Supabase client using the service_role key.
 * Bypasses RLS — authorization is enforced by the API middleware layer.
 * Use this in all API routes and data service files.
 */
export function getDb(): SupabaseClient {
  if (serverClient) return serverClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Supabase server client not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.'
    );
  }

  serverClient = createClient(supabaseUrl, serviceRoleKey);
  return serverClient;
}

export function getDbOrNull(): SupabaseClient | null {
  try {
    return getDb();
  } catch {
    return null;
  }
}

// Legacy alias — do not use in new code; kept for backward compat
export { getDb as getSupabase };
