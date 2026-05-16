/**
 * Sliding-window rate limit. In-memory implementation; Upstash adapter pluggable.
 *
 * Usage:
 *   const rl = rateLimiter({ windowMs: 15 * 60_000, max: 3 });
 *   const { allowed, retryAfter } = await rl.check(`otp:${email}`);
 */

interface Entry {
  hits: number[];
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export interface RateLimiter {
  check(key: string): Promise<RateLimitResult>;
  reset(key: string): Promise<void>;
}

class MemoryStore {
  private map = new Map<string, Entry>();
  private maxSize: number;

  constructor(maxSize = 50_000) {
    this.maxSize = maxSize;
  }

  get(key: string): Entry | undefined {
    return this.map.get(key);
  }

  set(key: string, entry: Entry): void {
    if (this.map.size >= this.maxSize) {
      // simple LRU-ish: drop oldest 10%
      const dropCount = Math.ceil(this.maxSize * 0.1);
      const keys = this.map.keys();
      for (let i = 0; i < dropCount; i++) {
        const k = keys.next().value;
        if (k === undefined) break;
        this.map.delete(k);
      }
    }
    this.map.set(key, entry);
  }

  delete(key: string): void {
    this.map.delete(key);
  }
}

const globalStore = new MemoryStore();

export function rateLimiter(cfg: RateLimitConfig): RateLimiter {
  if (!Number.isInteger(cfg.max) || cfg.max < 1) throw new Error('rateLimiter: max must be ≥1');
  if (!Number.isInteger(cfg.windowMs) || cfg.windowMs < 1000) {
    throw new Error('rateLimiter: windowMs must be ≥1000');
  }
  return {
    async check(key: string): Promise<RateLimitResult> {
      const now = Date.now();
      const cutoff = now - cfg.windowMs;
      const entry = globalStore.get(key) ?? { hits: [] };
      const recent = entry.hits.filter((t) => t > cutoff);
      if (recent.length >= cfg.max) {
        const oldest = recent[0]!;
        const retryAfterMs = cfg.windowMs - (now - oldest);
        globalStore.set(key, { hits: recent });
        return { allowed: false, remaining: 0, retryAfterMs: Math.max(retryAfterMs, 0) };
      }
      recent.push(now);
      globalStore.set(key, { hits: recent });
      return {
        allowed: true,
        remaining: cfg.max - recent.length,
        retryAfterMs: 0,
      };
    },
    async reset(key: string) {
      globalStore.delete(key);
    },
  };
}

// Common limiters
export const otpRequestLimiter = rateLimiter({ windowMs: 15 * 60_000, max: 3 });
export const otpRequestByIpLimiter = rateLimiter({ windowMs: 15 * 60_000, max: 10 });
export const otpVerifyLimiter = rateLimiter({ windowMs: 15 * 60_000, max: 10 });
export const enquiryLimiter = rateLimiter({ windowMs: 60 * 60_000, max: 10 });
export const checkoutLimiter = rateLimiter({ windowMs: 5 * 60_000, max: 20 });
export const cloudinarySignLimiter = rateLimiter({ windowMs: 60_000, max: 30 });
