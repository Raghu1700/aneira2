import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';

const COOKIE_NAME = 'aneira_cart';
const MAX_AGE = 60 * 60 * 24 * 60; // 60 days

export function generateCartToken(): string {
  return randomBytes(24).toString('base64url');
}

/**
 * Read cart token cookie. Returns null if absent.
 */
export async function readCartToken(): Promise<string | null> {
  const c = await cookies();
  return c.get(COOKIE_NAME)?.value ?? null;
}

/**
 * Read or create cart token. Sets cookie if newly created.
 */
export async function getOrCreateCartToken(): Promise<string> {
  const c = await cookies();
  const existing = c.get(COOKIE_NAME)?.value;
  if (existing) return existing;
  const token = generateCartToken();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
  return token;
}

export async function clearCartToken(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}
