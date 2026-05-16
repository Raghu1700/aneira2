/**
 * India Post pincode lookup with in-memory 24h LRU cache.
 * Free public endpoint: https://api.postalpincode.in/pincode/{pin}
 *
 * Failure modes: returns null. Never throws. Frontend should allow manual override.
 */

import { logger } from './logger';

export interface PincodeResult {
  pincode: string;
  city: string;
  state: string;
}

interface CacheEntry {
  value: PincodeResult | null;
  expires: number;
}

const cache = new Map<string, CacheEntry>();
const TTL_MS = 24 * 60 * 60_000;
const MAX_ENTRIES = 5_000;
const TIMEOUT_MS = 3_000;

function setCache(pin: string, value: PincodeResult | null): void {
  if (cache.size >= MAX_ENTRIES) {
    const first = cache.keys().next().value;
    if (first !== undefined) cache.delete(first);
  }
  cache.set(pin, { value, expires: Date.now() + TTL_MS });
}

export async function lookupPincode(pin: string): Promise<PincodeResult | null> {
  if (!/^[0-9]{6}$/.test(pin)) return null;

  const cached = cache.get(pin);
  if (cached && cached.expires > Date.now()) return cached.value;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      setCache(pin, null);
      return null;
    }
    const body = (await res.json()) as Array<{
      Status: string;
      PostOffice?: Array<{ District: string; State: string }>;
    }>;
    const first = body?.[0];
    if (!first || first.Status !== 'Success' || !first.PostOffice?.length) {
      setCache(pin, null);
      return null;
    }
    const office = first.PostOffice[0]!;
    const result: PincodeResult = {
      pincode: pin,
      city: office.District,
      state: office.State,
    };
    setCache(pin, result);
    return result;
  } catch (err) {
    if (err instanceof Error && err.name !== 'AbortError') {
      logger.warn({ err, pin }, 'pincode lookup failed');
    }
    setCache(pin, null);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
