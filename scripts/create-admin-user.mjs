// One-time setup script: creates the Supabase Auth account used to sign
// in to /admin, and adds it to the admin_users allowlist table so it's
// actually permitted to log in (a Supabase Auth account alone is not
// enough — see src/app/admin/login/actions.ts).
//
// Usage (after filling in .env.local, including SUPABASE_SERVICE_ROLE_KEY,
// ADMIN_EMAIL, and ADMIN_PASSWORD):
//
//   node --env-file=.env.local scripts/create-admin-user.mjs
//
// Safe to re-run: if the account already exists, it's reused, and the
// allowlist insert is a no-op if the row is already there.

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!url || !serviceRoleKey) {
  console.error(
    "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Fill them in .env.local first."
  );
  process.exit(1);
}
if (!email || !password) {
  console.error(
    "Missing ADMIN_EMAIL / ADMIN_PASSWORD. Set them in .env.local first (used once by this script, not read by the app at runtime)."
  );
  process.exit(1);
}
if (password.length < 8) {
  console.error("ADMIN_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  let userId;

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    if (!createError.message.toLowerCase().includes("already been registered")) {
      throw createError;
    }
    console.log(`Auth user for ${email} already exists — looking it up.`);
    const { data: list, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;
    const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!existing) throw new Error("Could not find the existing user by email.");
    userId = existing.id;
  } else {
    userId = created.user.id;
    console.log(`Created Supabase Auth user for ${email} (${userId}).`);
  }

  const { error: allowlistError } = await supabase
    .from("admin_users")
    .upsert({ id: userId, email }, { onConflict: "id" });

  if (allowlistError) throw allowlistError;

  console.log(`✔ ${email} is now allowlisted for /admin.`);
  console.log("You can log in at /admin/login with this email and the password you set.");
}

main().catch((error) => {
  console.error("Failed to provision the admin user:", error.message ?? error);
  process.exit(1);
});
