/**
 * Webhook idempotency.
 * Use markEventProcessed before doing any side-effecting work.
 * If it returns 'duplicate', skip processing and return 200.
 */

import { createHash } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { db } from './db';

export type ProcessResult = 'new' | 'duplicate';

export async function markEventProcessed(
  provider: string,
  eventId: string,
  payload: unknown,
): Promise<ProcessResult> {
  const payloadHash = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  try {
    await db.webhookEvent.create({
      data: { provider, eventId, payloadHash },
    });
    return 'new';
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return 'duplicate';
    }
    throw err;
  }
}
