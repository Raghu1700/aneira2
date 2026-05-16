'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { db } from '@/lib/db';
import { issueOtp } from '@/lib/otp';
import { logger } from '@/lib/logger';
import { sendEmail } from '@/lib/email';
import { otpRequestLimiter, otpRequestByIpLimiter } from '@/lib/rate-limit';
import { withErrors, type ActionResult } from '@/lib/errors';
import { AppError } from '@/lib/errors';
import { requestOtpSchema, verifyOtpSchema } from '@/lib/validators/auth';
import { signIn as authSignIn, signOut as authSignOut } from '@/lib/auth';
import OtpCodeEmail from '@/emails/OtpCode';

export async function requestOtp(input: unknown): Promise<ActionResult<{ ok: true }>> {
  return withErrors(async () => {
    const parsed = requestOtpSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT', 'Enter a valid email.');

    const hdrs = await headers();
    const ip =
      hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? hdrs.get('x-real-ip') ?? 'unknown';
    const ua = hdrs.get('user-agent') ?? null;

    const emailLimit = await otpRequestLimiter.check(`otp:${parsed.data.email}`);
    const ipLimit = await otpRequestByIpLimiter.check(`otp-ip:${ip}`);
    if (!emailLimit.allowed || !ipLimit.allowed) {
      throw new AppError('RATE_LIMITED', 'Too many code requests. Please wait a few minutes.');
    }

    const { code, expiresAt } = await issueOtp({
      email: parsed.data.email,
      ipAddress: ip === 'unknown' ? null : ip,
      userAgent: ua,
    });

    await sendEmail({
      to: parsed.data.email,
      template: 'OtpCode',
      subject: 'Your Aneira sign-in code',
      payload: { code, expiresAt: expiresAt.toISOString() },
      element: OtpCodeEmail({ code, expiresAt }),
    });

    logger.info({ email: parsed.data.email }, 'otp issued');
    return { ok: true } as const;
  });
}

export async function verifyOtp(input: unknown): Promise<ActionResult<{ redirect: string }>> {
  return withErrors(async () => {
    const parsed = verifyOtpSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT', 'Enter the 6-digit code.');

    try {
      await authSignIn('customer-otp', {
        email: parsed.data.email,
        code: parsed.data.code,
        redirect: false,
      });
    } catch (err) {
      // Auth.js throws CredentialsSignin error on auth failure.
      logger.warn({ err: (err as Error).message }, 'otp verify failed');
      throw new AppError('UNAUTHORIZED', 'Invalid or expired code.');
    }

    return { redirect: '/account' };
  });
}

export async function signOutAction(): Promise<ActionResult<{ ok: true }>> {
  return withErrors(async () => {
    await authSignOut({ redirect: false });
    return { ok: true } as const;
  });
}

const adminSignInSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .strict();

export async function adminSignIn(input: unknown): Promise<ActionResult<{ redirect: string }>> {
  return withErrors(async () => {
    const parsed = adminSignInSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT', 'Email and password are required.');

    try {
      await authSignIn('admin', { ...parsed.data, redirect: false });
    } catch {
      throw new AppError('UNAUTHORIZED', 'Invalid email or password.');
    }
    return { redirect: '/admin' };
  });
}

/** Resolve current cart by token or session; used by other actions internally */
export async function _internalResolveCart(token: string | null, userId: string | null) {
  if (token) {
    const c = await db.cart.findUnique({ where: { token }, include: { items: true } });
    if (c) return c;
  }
  if (userId) {
    return db.cart.findFirst({ where: { userId }, include: { items: true } });
  }
  return null;
}
