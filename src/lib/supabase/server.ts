import { createClient } from "@supabase/supabase-js";

/**
 * Untyped on purpose: the installed @supabase/postgrest-js version's
 * Database-generic type inference collapses to `never` for this project's
 * schema shape (a library/TS-version interaction, not a schema bug). Row
 * shapes are enforced manually at each call site via the interfaces in
 * ./types instead of the client's generic parameter.
 */
export function createServiceClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase environment variables are not configured (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
