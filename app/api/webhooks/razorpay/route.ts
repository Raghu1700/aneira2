/**
 * Razorpay webhook receiver.
 *
 * - Reads the raw body (required for HMAC).
 * - Verifies signature against RAZORPAY_WEBHOOK_SECRET.
 * - Idempotency-deduped via WebhookEvent.
 * - Reconciles Order.paymentStatus for payment.captured / payment.failed.
 * - Always returns 200 after recording the event to prevent retries spam.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { markEventProcessed } from '@/lib/webhooks';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RzpEvent {
  event: string;
  payload?: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        status: string;
        method?: string;
        amount?: number;
      };
    };
    order?: { entity: { id: string } };
  };
  id?: string;
  created_at?: number;
}

async function readRawBody(req: Request): Promise<string> {
  return new Response(req.body, { headers: req.headers }).text();
}

export async function POST(req: Request) {
  const signature = req.headers.get('x-razorpay-signature') ?? '';
  const raw = await readRawBody(req);

  if (!raw || !signature || !verifyWebhookSignature({ rawBody: raw, signature })) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
  }

  let body: RzpEvent;
  try {
    body = JSON.parse(raw) as RzpEvent;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const eventId =
    body.id ?? body.payload?.payment?.entity.id ?? `${body.event}:${body.created_at ?? Date.now()}`;

  const dedup = await markEventProcessed('razorpay', eventId, body);
  if (dedup === 'duplicate') {
    return NextResponse.json({ ok: true, dedup: true });
  }

  try {
    const payment = body.payload?.payment?.entity;
    if (!payment) {
      logger.warn({ event: body.event }, 'razorpay webhook: no payment entity');
      return NextResponse.json({ ok: true });
    }

    const order = await db.order.findUnique({
      where: { razorpayOrderId: payment.order_id },
      include: { items: true },
    });
    if (!order) {
      logger.warn({ rzpOrderId: payment.order_id }, 'razorpay webhook: order not found');
      return NextResponse.json({ ok: true });
    }

    if (body.event === 'payment.captured') {
      if (order.paymentStatus !== 'PAID') {
        await db.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'PAID',
            status: order.status === 'PENDING' ? 'CONFIRMED' : order.status,
            razorpayPaymentId: payment.id,
          },
        });
        logger.info({ orderNumber: order.orderNumber }, 'webhook reconciled to PAID');
      }
    } else if (body.event === 'payment.failed') {
      if (order.paymentStatus !== 'PAID' && order.paymentStatus !== 'REFUNDED') {
        // restore inventory
        for (const item of order.items) {
          if (item.variantId) {
            await db.productVariant.update({
              where: { id: item.variantId },
              data: { inventory: { increment: item.quantity } },
            });
          } else {
            await db.product.update({
              where: { id: item.productId },
              data: { inventory: { increment: item.quantity } },
            });
          }
        }
        await db.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'FAILED', status: 'CANCELLED', cancelledAt: new Date() },
        });
        logger.info({ orderNumber: order.orderNumber }, 'webhook reconciled to FAILED');
      }
    } else {
      logger.info({ event: body.event }, 'razorpay webhook: unhandled event');
    }
  } catch (err) {
    logger.error({ err }, 'razorpay webhook processing error');
    // We still return 200 because the event is recorded — manual reconcile only.
  }

  return NextResponse.json({ ok: true });
}
