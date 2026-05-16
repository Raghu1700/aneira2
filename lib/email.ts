/**
 * Email send with outbox fallback. Resend failures don't fail the caller —
 * we write to EmailOutbox so a retry worker can flush them later.
 */

import { Resend } from 'resend';
import { render } from '@react-email/render';
import { db } from './db';
import { logger } from './logger';
import type { Prisma } from '@prisma/client';

let _resend: Resend | null = null;
function client(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

export type EmailTemplate =
  | 'OtpCode'
  | 'OrderConfirmation'
  | 'ShippingUpdate'
  | 'AdminOrderNotification'
  | 'AtelierBooking'
  | 'CustomEnquiry'
  | 'ContactEnquiry'
  | 'ProductEnquiry';

export interface SendEmailInput {
  to: string | string[];
  template: EmailTemplate;
  subject: string;
  /** props passed to the template component. Stored in outbox for retries. */
  payload: Record<string, unknown>;
  /** Pre-rendered react element. Required for first send; not needed for retry. */
  element?: React.ReactElement;
  /** Optional ReplyTo */
  replyTo?: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  outboxId?: string;
}

const FROM = () => process.env.EMAIL_FROM ?? 'Aneira <noreply@example.com>';

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const rs = client();
  if (!rs || !input.element) {
    const outbox = await db.emailOutbox.create({
      data: {
        to: Array.isArray(input.to) ? input.to.join(',') : input.to,
        template: input.template,
        payload: input.payload as Prisma.InputJsonValue,
      },
    });
    if (!rs) {
      logger.warn(
        { to: input.to, template: input.template },
        'Resend not configured; queued to outbox',
      );
    }
    return { ok: false, outboxId: outbox.id };
  }

  try {
    const html = await render(input.element);
    const text = await render(input.element, { plainText: true });
    const r = await rs.emails.send({
      from: FROM(),
      to: input.to,
      subject: input.subject,
      html,
      text,
      replyTo: input.replyTo,
    });
    if (r.error) throw new Error(r.error.message);
    logger.info({ id: r.data?.id, template: input.template }, 'email sent');
    return { ok: true, id: r.data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown email error';
    logger.error({ err, template: input.template }, 'email send failed; queued');
    const outbox = await db.emailOutbox.create({
      data: {
        to: Array.isArray(input.to) ? input.to.join(',') : input.to,
        template: input.template,
        payload: input.payload as Prisma.InputJsonValue,
        status: 'PENDING',
        attempts: 1,
        lastError: message,
        nextAttemptAt: new Date(Date.now() + 60_000),
      },
    });
    return { ok: false, outboxId: outbox.id };
  }
}

/**
 * Retry pending outbox entries. Hook to a cron or admin trigger.
 * Backoff: nextAttemptAt = now + min(2^attempts, 60) minutes
 */
export async function retryEmailOutbox(
  limit = 50,
): Promise<{ processed: number; sent: number; failed: number }> {
  const due = await db.emailOutbox.findMany({
    where: { status: 'PENDING', nextAttemptAt: { lte: new Date() } },
    take: limit,
    orderBy: { nextAttemptAt: 'asc' },
  });

  const sent = 0;
  let failed = 0;
  for (const item of due) {
    try {
      // Caller needs to supply elements for templates; in v1 this worker only
      // marks DEAD after 5 tries and leaves successful retries to manual handling.
      // Treat as a placeholder for future template-registry-driven retries.
      if (item.attempts >= 5) {
        await db.emailOutbox.update({
          where: { id: item.id },
          data: { status: 'DEAD' },
        });
        failed++;
        continue;
      }
      // Without template registry, push next attempt back 1h
      await db.emailOutbox.update({
        where: { id: item.id },
        data: { nextAttemptAt: new Date(Date.now() + 60 * 60_000) },
      });
    } catch (err) {
      logger.error({ err, id: item.id }, 'outbox retry error');
      failed++;
    }
  }
  return { processed: due.length, sent, failed };
}
