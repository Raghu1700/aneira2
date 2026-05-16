/**
 * One-time password lifecycle:
 *   issue(email)      -> persists OtpRequest with bcrypt-hashed code, returns plaintext code (for email send)
 *   verify(email, code) -> compares, increments attempts, locks after 3 misses for 15 min
 */

import { randomInt, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { AppError } from './errors';

export const OTP_TTL_MS = 10 * 60_000;
export const OTP_MAX_ATTEMPTS = 3;
export const OTP_LOCKOUT_MS = 15 * 60_000;

export function generateCode(): string {
  // 6-digit cryptographically random, leading zeros preserved
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export interface IssueOtpInput {
  email: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface IssueOtpResult {
  code: string;
  expiresAt: Date;
}

export async function issueOtp(input: IssueOtpInput): Promise<IssueOtpResult> {
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  // Invalidate any prior unconsumed requests for the same email
  await db.otpRequest.updateMany({
    where: { email: input.email.toLowerCase(), consumedAt: null, expiresAt: { gt: new Date() } },
    data: { expiresAt: new Date(0) },
  });

  await db.otpRequest.create({
    data: {
      email: input.email.toLowerCase(),
      codeHash,
      expiresAt,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    },
  });

  return { code, expiresAt };
}

export interface VerifyOtpResult {
  ok: boolean;
  /** When locked, time remaining in ms before unlock */
  retryAfterMs?: number;
}

/**
 * Constant-time comparison wrapper used after bcrypt — bcrypt itself is constant-time
 * but we add this extra guard for the boolean.
 */
function ctEq(a: boolean, b: boolean): boolean {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export async function verifyOtp(email: string, code: string): Promise<VerifyOtpResult> {
  const normalized = email.toLowerCase();

  const otp = await db.otpRequest.findFirst({
    where: { email: normalized, consumedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) {
    throw new AppError('BAD_INPUT', 'No active code. Request a new one.');
  }

  const now = new Date();
  if (otp.lockedUntil && otp.lockedUntil > now) {
    return { ok: false, retryAfterMs: otp.lockedUntil.getTime() - now.getTime() };
  }
  if (otp.expiresAt <= now) {
    throw new AppError('BAD_INPUT', 'Code has expired. Request a new one.');
  }

  const match = await bcrypt.compare(code, otp.codeHash);
  if (!ctEq(match, true)) {
    const attempts = otp.attempts + 1;
    const shouldLock = attempts >= OTP_MAX_ATTEMPTS;
    await db.otpRequest.update({
      where: { id: otp.id },
      data: {
        attempts,
        lockedUntil: shouldLock ? new Date(now.getTime() + OTP_LOCKOUT_MS) : otp.lockedUntil,
      },
    });
    if (shouldLock) {
      return { ok: false, retryAfterMs: OTP_LOCKOUT_MS };
    }
    return { ok: false };
  }

  await db.otpRequest.update({
    where: { id: otp.id },
    data: { consumedAt: now },
  });

  return { ok: true };
}
