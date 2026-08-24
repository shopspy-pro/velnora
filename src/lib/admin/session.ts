import { cookies } from "next/headers";
import crypto from "node:crypto";

/**
 * Admin session cookie: a tamper-evident (HMAC-signed, timing-safe verified)
 * httpOnly cookie issued only after a real Supabase Auth sign-in succeeds
 * AND the account is present in the admin_users allowlist (see
 * src/app/admin/login/actions.ts). Set a real, unguessable
 * ADMIN_SESSION_SECRET in production — the fallback below is dev-only.
 */

export const SESSION_COOKIE = "velnora_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

export interface AdminSessionPayload {
  admin: true;
  email: string;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "ADMIN_SESSION_SECRET is not set. Refusing to start an admin session in production without it."
    );
  }
  // Local-dev-only fallback so the demo runs without any .env setup.
  // Never reachable in production — the check above throws first.
  return "velnora-local-dev-only-secret-change-me";
}

function sign(body: string): string {
  return crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");
}

function encode(payload: AdminSessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

/** Pure, side-effect-free verification — safe to call from proxy.ts (Node runtime, no next/headers access there). */
export function decodeSession(token: string | undefined | null): AdminSessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as AdminSessionPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createAdminSession(email: string): Promise<void> {
  const token = encode({ admin: true, email, exp: Date.now() + SESSION_TTL_MS });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function destroyAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const store = await cookies();
  return decodeSession(store.get(SESSION_COOKIE)?.value);
}
