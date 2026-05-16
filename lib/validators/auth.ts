import { z } from 'zod';
import { email, otpCode } from './common';

export const requestOtpSchema = z
  .object({
    email,
    callbackUrl: z.string().optional(),
  })
  .strict();

export const verifyOtpSchema = z
  .object({
    email,
    code: otpCode,
  })
  .strict();

export const adminCredentialsSchema = z
  .object({
    email,
    password: z.string().min(12, 'Password must be at least 12 characters'),
  })
  .strict();

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type AdminCredentialsInput = z.infer<typeof adminCredentialsSchema>;
