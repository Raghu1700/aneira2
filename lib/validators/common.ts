import { z } from 'zod';

export const cuid = z.string().regex(/^c[a-z0-9]{20,30}$/, 'Invalid id');
export const email = z.string().trim().toLowerCase().email('Enter a valid email address');
export const indianPhone = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{10,15}$/, 'Enter a valid phone number');
export const pincode = z.string().trim().regex(/^[0-9]{6}$/, 'Enter a valid 6-digit pincode');
export const otpCode = z.string().trim().regex(/^[0-9]{6}$/, 'Enter the 6-digit code');
export const positiveInt = z.number().int().positive();
export const nonNegativeInt = z.number().int().nonnegative();
export const slugStr = z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/, 'Lowercase letters, digits, hyphens only');
export const moneyStr = z
  .union([z.number(), z.string()])
  .transform((v) => (typeof v === 'number' ? v.toString() : v.trim()))
  .refine((s) => /^[0-9]+(\.[0-9]{1,2})?$/.test(s), { message: 'Invalid amount' });

export const honeypot = z.string().max(0, 'Bot detected').optional().default('');
