/**
 * Typed application error. Never leaks internal details.
 * Action results: { ok: false, error: { code, message, fields? } }.
 */

export type ErrorCode =
  | 'BAD_INPUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'OUT_OF_STOCK'
  | 'PAYMENT_INVALID'
  | 'EMAIL_FAILED'
  | 'INTERNAL';

const STATUS: Record<ErrorCode, number> = {
  BAD_INPUT: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  OUT_OF_STOCK: 409,
  PAYMENT_INVALID: 400,
  EMAIL_FAILED: 500,
  INTERNAL: 500,
};

const USER_MESSAGE: Record<ErrorCode, string> = {
  BAD_INPUT: 'The information provided is incomplete or invalid.',
  UNAUTHORIZED: 'Please sign in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'We could not find what you were looking for.',
  CONFLICT: 'This request conflicts with the current state.',
  RATE_LIMITED: 'Too many attempts. Please wait a few minutes.',
  OUT_OF_STOCK: 'One or more items are no longer available.',
  PAYMENT_INVALID: 'Payment could not be verified. Please try again.',
  EMAIL_FAILED: 'We could not send the message. Please try again.',
  INTERNAL: 'Something went wrong on our side. Please try again shortly.',
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly fields?: Record<string, string>;
  override readonly cause?: unknown;

  constructor(
    code: ErrorCode,
    message?: string,
    opts?: { fields?: Record<string, string>; cause?: unknown },
  ) {
    super(message ?? USER_MESSAGE[code]);
    this.code = code;
    this.status = STATUS[code];
    this.fields = opts?.fields;
    this.cause = opts?.cause;
    this.name = 'AppError';
  }

  toJSON() {
    return { code: this.code, message: this.message, fields: this.fields };
  }
}

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ErrorCode; message: string; fields?: Record<string, string> } };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(
  code: ErrorCode,
  message?: string,
  fields?: Record<string, string>,
): ActionResult<never> {
  return { ok: false, error: { code, message: message ?? USER_MESSAGE[code], fields } };
}

/**
 * Wrap a server-action body so AppErrors become fail() results
 * and unexpected errors are logged + converted to INTERNAL.
 */
export async function withErrors<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return ok(await fn());
  } catch (err) {
    if (err instanceof AppError) {
      return { ok: false, error: { code: err.code, message: err.message, fields: err.fields } };
    }
    const { logger } = await import('./logger');
    logger.error({ err }, 'unhandled action error');
    return fail('INTERNAL');
  }
}
