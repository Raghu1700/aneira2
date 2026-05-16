/**
 * Cloudinary signed-upload helpers.
 * We never proxy upload bytes — we just sign the params client uploads with.
 */

import { createHash } from 'node:crypto';
import { AppError } from './errors';

export interface SignUploadInput {
  folder: string;
  publicId?: string;
  /** comma-separated, e.g. "jpg,png,webp" */
  allowedFormats?: string;
  /** bytes */
  maxFileSize?: number;
  /** defaults to env CLOUDINARY_UPLOAD_PRESET */
  uploadPreset?: string;
  /** epoch seconds; if omitted current time used */
  timestamp?: number;
}

export interface SignedUpload {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
  uploadPreset: string;
  publicId?: string;
  allowedFormats?: string;
  maxFileSize?: number;
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new AppError('INTERNAL', `${name} not configured.`);
  return v;
}

/**
 * Build the upload signature per Cloudinary spec:
 *   SHA1( "<sorted params joined by &>" + apiSecret )
 * Only includes params actually submitted with the upload.
 */
export function signUpload(input: SignUploadInput): SignedUpload {
  const cloudName = requireEnv('CLOUDINARY_CLOUD_NAME');
  const apiKey = requireEnv('CLOUDINARY_API_KEY');
  const apiSecret = requireEnv('CLOUDINARY_API_SECRET');
  const uploadPreset = input.uploadPreset ?? requireEnv('CLOUDINARY_UPLOAD_PRESET');

  if (!/^[a-z0-9_/\-]+$/i.test(input.folder)) {
    throw new AppError('BAD_INPUT', 'Invalid folder.');
  }
  if (input.publicId && !/^[a-z0-9_/\-]+$/i.test(input.publicId)) {
    throw new AppError('BAD_INPUT', 'Invalid publicId.');
  }

  const timestamp = input.timestamp ?? Math.floor(Date.now() / 1000);

  // Build params to sign. Order doesn't matter — Cloudinary requires alphabetical.
  const params: Record<string, string> = {
    folder: input.folder,
    timestamp: String(timestamp),
    upload_preset: uploadPreset,
  };
  if (input.publicId) params.public_id = input.publicId;
  if (input.allowedFormats) params.allowed_formats = input.allowedFormats;

  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');

  const signature = createHash('sha1')
    .update(toSign + apiSecret)
    .digest('hex');

  return {
    timestamp,
    signature,
    apiKey,
    cloudName,
    folder: input.folder,
    uploadPreset,
    publicId: input.publicId,
    allowedFormats: input.allowedFormats,
    maxFileSize: input.maxFileSize,
  };
}

export const UPLOAD_KINDS = {
  product: {
    folder: 'aneira/products',
    allowedFormats: 'jpg,jpeg,png,webp,avif',
    maxFileSize: 8 * 1024 * 1024,
  },
  collection: {
    folder: 'aneira/collections',
    allowedFormats: 'jpg,jpeg,png,webp,avif',
    maxFileSize: 8 * 1024 * 1024,
  },
  enquiry: {
    folder: 'aneira/enquiries',
    allowedFormats: 'jpg,jpeg,png,webp,heic,heif',
    maxFileSize: 5 * 1024 * 1024,
  },
} as const;

export type UploadKind = keyof typeof UPLOAD_KINDS;
