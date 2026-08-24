"use server";

import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/server";
import { createAdminSession } from "@/lib/admin/session";
import type { AdminUserRow } from "@/lib/supabase/types";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return {
      error: "Supabase is not configured yet — set the Supabase env vars in .env.local.",
    };
  }

  // A short-lived client just for this sign-in attempt; not persisted anywhere.
  const authClient = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await authClient.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "Invalid email or password." };
  }

  // A successful Supabase Auth login is not sufficient on its own — the
  // account must also be in the admin_users allowlist, so a stray public
  // signup against this Supabase project can never self-grant admin access.
  const supabase = createServiceClient();
  const { data: allowlisted } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!(allowlisted as AdminUserRow | null)) {
    return { error: "This account is not authorized for admin access." };
  }

  await createAdminSession(data.user.email ?? email);
  redirect("/admin");
}
