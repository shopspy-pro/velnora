import { createClient } from "@supabase/supabase-js";

/**
 * Public, anon-key client — safe to use in Server or Client Components for
 * read-only, RLS-gated data (e.g. published reviews). Never use for writes.
 * Untyped for the same reason as ./server.ts — see the comment there.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
