#!/usr/bin/env tsx
/**
 * Validates required environment variables.
 * In production, missing required vars cause process exit 1.
 * In development, warns but allows boot.
 */

import { z } from 'zod';

const url = z.string().url();
const nonEmpty = z.string().min(1);

const baseSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: url,
  DATABASE_URL: nonEmpty,
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 chars'),
});

const prodOnly = z.object({
  RAZORPAY_KEY_ID: nonEmpty,
  RAZORPAY_KEY_SECRET: nonEmpty,
  RAZORPAY_WEBHOOK_SECRET: nonEmpty,
  NEXT_PUBLIC_RAZORPAY_KEY_ID: nonEmpty,
  CLOUDINARY_CLOUD_NAME: nonEmpty,
  CLOUDINARY_API_KEY: nonEmpty,
  CLOUDINARY_API_SECRET: nonEmpty,
  CLOUDINARY_UPLOAD_PRESET: nonEmpty,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: nonEmpty,
  RESEND_API_KEY: nonEmpty,
  EMAIL_FROM: nonEmpty,
  EMAIL_NOTIFY_TO: z.string().email(),
});

function fail(errors: z.ZodIssue[]): never {
  console.error('\nx Missing or invalid environment variables:\n');
  for (const e of errors) {
    console.error(`  - ${e.path.join('.')}: ${e.message}`);
  }
  console.error('\nFix .env.local (dev) or Vercel project env (prod). See .env.example.\n');
  process.exit(1);
}

function warn(errors: z.ZodIssue[]): void {
  console.warn('\n! Some environment variables are not set (dev mode — continuing):\n');
  for (const e of errors) {
    console.warn(`  - ${e.path.join('.')}: ${e.message}`);
  }
  console.warn('');
}

function main() {
  const env = process.env;
  const baseParse = baseSchema.safeParse(env);
  if (!baseParse.success) {
    if (env.NODE_ENV === 'production') fail(baseParse.error.issues);
    warn(baseParse.error.issues);
  }
  if (env.NODE_ENV === 'production') {
    const prodParse = prodOnly.safeParse(env);
    if (!prodParse.success) fail(prodParse.error.issues);
  }
  console.log('+ env check passed');
}

main();
