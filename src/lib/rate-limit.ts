/**
 * Lightweight in-memory, fixed-window rate limiter.
 *
 * This blunts casual brute-force/spam (repeated login guesses, checkout/
 * newsletter/chat abuse from a single client) within one warm serverless
 * instance. It is NOT a substitute for a shared store (Upstash/Vercel KV)
 * under real distributed load — each cold-started instance keeps its own
 * counters — but it's a meaningful, zero-dependency improvement over no
 * limiting at all, and is what every one of these endpoints had before.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Opportunistic cleanup so the map can't grow unbounded over a long-lived
// warm instance — runs at most once every 5 minutes, on whichever call
// happens to land after that window.
let lastSweep = Date.now();
function sweep() {
  const now = Date.now();
  if (now - lastSweep < 5 * 60 * 1000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterSeconds?: number;
}

/** `key` should already include a namespace, e.g. `login:203.0.113.4`. */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  sweep();
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { ok: true };
}

/** Best-effort client IP from standard proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(headersList: Headers): string {
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headersList.get("x-real-ip") ?? "unknown";
}
