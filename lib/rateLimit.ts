import { env } from './env';

// Optional: Upstash-based rate limiting if configured
type UpstashLimiter = {
  limit: (key: string) => Promise<{ success: boolean; remaining: number; reset: number }>;
} | null;

let upstashLimiter: UpstashLimiter = null;
async function getUpstashLimiter(): Promise<UpstashLimiter> {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return null;
  if (upstashLimiter) return upstashLimiter;
  const { Ratelimit } = await import('@upstash/ratelimit');
  const { Redis } = await import('@upstash/redis');
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
  upstashLimiter = new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(60, '1 m') });
  return upstashLimiter;
}

// Simple in-memory fallback (per-process only; not for multi-instance)
const memoryStore = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  key: string,
  max = 60,
  windowMs = 60_000,
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const upstash = await getUpstashLimiter();
  if (upstash) {
    const { success, remaining, reset } = await upstash.limit(key);
    return { allowed: success, remaining, reset: reset * 1000 } as const;
  }

  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || entry.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, reset: now + windowMs } as const;
  }
  if (entry.count >= max) {
    return { allowed: false, remaining: 0, reset: entry.resetAt } as const;
  }
  entry.count += 1;
  return { allowed: true, remaining: max - entry.count, reset: entry.resetAt } as const;
}
