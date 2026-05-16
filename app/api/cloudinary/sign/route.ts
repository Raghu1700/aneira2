/**
 * Cloudinary signed-upload token issuer.
 *
 * Admin-only for product/collection kinds.
 * For 'enquiry' kind we allow unauthenticated uploads (custom enquiry form)
 * but rate-limit per IP. Folder is fixed in UPLOAD_KINDS to prevent path injection.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { headers } from 'next/headers';
import { requireAdmin } from '@/lib/auth-guards';
import { signUpload, UPLOAD_KINDS, type UploadKind } from '@/lib/cloudinary';
import { cloudinarySignLimiter } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const signSchema = z
  .object({
    kind: z.enum(['product', 'collection', 'enquiry']),
    publicId: z.string().regex(/^[a-z0-9_\-/]+$/i).max(100).optional(),
  })
  .strict();

function checkOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (!origin || !host) return false;
  try {
    const u = new URL(origin);
    return u.host === host;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!checkOrigin(req)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const hdrs = await headers();
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rl = await cloudinarySignLimiter.check(`cld:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = signSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const kind = parsed.data.kind as UploadKind;
  const config = UPLOAD_KINDS[kind];

  if (kind === 'product' || kind === 'collection') {
    try {
      await requireAdmin();
    } catch {
      // 404 — never hint that admin exists
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
  }

  try {
    const signed = signUpload({
      folder: config.folder,
      allowedFormats: config.allowedFormats,
      maxFileSize: config.maxFileSize,
      publicId: parsed.data.publicId,
    });
    return NextResponse.json(signed);
  } catch (err) {
    logger.error({ err }, 'cloudinary sign failed');
    return NextResponse.json({ error: 'sign_failed' }, { status: 500 });
  }
}
