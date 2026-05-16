'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { Prisma, OrderStatus } from '@prisma/client';
import { requireAdmin } from '@/lib/auth-guards';
import { withErrors, AppError, type ActionResult } from '@/lib/errors';
import { sendEmail } from '@/lib/email';
import {
  addOrderNoteSchema,
  addTrackingSchema,
  markRefundedSchema,
  orderStatusSchema,
  updateOrderStatusSchema,
} from '@/lib/validators/order';
import ShippingUpdateEmail from '@/emails/ShippingUpdate';

/**
 * Allowed transitions. CANCELLED only from non-terminal states.
 * REFUNDED only after PAID + (SHIPPED ok too for partial). DELIVERED is terminal except REFUNDED.
 */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CRAFTING', 'SHIPPED', 'CANCELLED', 'REFUNDED'],
  CRAFTING: ['SHIPPED', 'CANCELLED', 'REFUNDED'],
  SHIPPED: ['DELIVERED', 'REFUNDED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

export async function adminListOrders(input: unknown): Promise<
  ActionResult<{
    items: Array<{
      id: string;
      orderNumber: string;
      status: string;
      paymentStatus: string;
      email: string;
      shipFullName: string;
      total: string;
      createdAt: string;
    }>;
    total: number;
  }>
> {
  return withErrors(async () => {
    await requireAdmin();
    const schema = z
      .object({
        q: z.string().trim().max(80).optional(),
        status: orderStatusSchema.optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      })
      .strict();
    const parsed = schema.safeParse(input ?? {});
    if (!parsed.success) throw new AppError('BAD_INPUT');

    const where: Prisma.OrderWhereInput = {};
    if (parsed.data.q) {
      where.OR = [
        { orderNumber: { contains: parsed.data.q, mode: 'insensitive' } },
        { email: { contains: parsed.data.q, mode: 'insensitive' } },
        { shipFullName: { contains: parsed.data.q, mode: 'insensitive' } },
      ];
    }
    if (parsed.data.status) where.status = parsed.data.status;

    const [total, rows] = await db.$transaction([
      db.order.count({ where }),
      db.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parsed.data.page - 1) * parsed.data.pageSize,
        take: parsed.data.pageSize,
      }),
    ]);

    return {
      total,
      items: rows.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        paymentStatus: o.paymentStatus,
        email: o.email,
        shipFullName: o.shipFullName,
        total: o.total.toString(),
        createdAt: o.createdAt.toISOString(),
      })),
    };
  });
}

export async function adminGetOrder(id: string): Promise<ActionResult<unknown>> {
  return withErrors(async () => {
    await requireAdmin();
    const o = await db.order.findUnique({
      where: { id },
      include: { items: true, user: { select: { id: true, email: true, name: true } } },
    });
    if (!o) throw new AppError('NOT_FOUND');
    return o;
  });
}

export async function adminUpdateOrderStatus(input: unknown): Promise<ActionResult<{ ok: true }>> {
  return withErrors(async () => {
    await requireAdmin();
    const parsed = updateOrderStatusSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT');
    const o = await db.order.findUnique({ where: { id: parsed.data.orderId } });
    if (!o) throw new AppError('NOT_FOUND');

    if (parsed.data.status === o.status) return { ok: true } as const;
    if (!TRANSITIONS[o.status].includes(parsed.data.status)) {
      throw new AppError('CONFLICT', `Cannot move ${o.status} → ${parsed.data.status}.`);
    }

    const update: Prisma.OrderUpdateInput = { status: parsed.data.status };
    if (parsed.data.status === 'DELIVERED') update.deliveredAt = new Date();
    if (parsed.data.status === 'CANCELLED') update.cancelledAt = new Date();
    if (parsed.data.status === 'REFUNDED') {
      update.refundedAt = new Date();
      update.paymentStatus = 'REFUNDED';
    }

    await db.order.update({ where: { id: o.id }, data: update });
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${o.id}`);
    return { ok: true } as const;
  });
}

export async function adminAddTracking(input: unknown): Promise<ActionResult<{ ok: true }>> {
  return withErrors(async () => {
    await requireAdmin();
    const parsed = addTrackingSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT');
    const o = await db.order.findUnique({ where: { id: parsed.data.orderId } });
    if (!o) throw new AppError('NOT_FOUND');

    const now = new Date();
    const newStatus =
      o.status === 'SHIPPED' || o.status === 'DELIVERED' ? o.status : 'SHIPPED';

    await db.order.update({
      where: { id: o.id },
      data: {
        trackingNumber: parsed.data.trackingNumber,
        carrier: parsed.data.carrier || null,
        shippedAt: o.shippedAt ?? now,
        status: newStatus,
      },
    });

    if (!o.shippingEmailSent) {
      await sendEmail({
        to: o.email,
        template: 'ShippingUpdate',
        subject: `Your Aneira order is on its way — ${o.orderNumber}`,
        payload: { orderId: o.id, trackingNumber: parsed.data.trackingNumber, carrier: parsed.data.carrier },
        element: ShippingUpdateEmail({
          orderNumber: o.orderNumber,
          customerName: o.shipFullName,
          trackingNumber: parsed.data.trackingNumber,
          carrier: parsed.data.carrier || undefined,
        }),
      });
      await db.order.update({ where: { id: o.id }, data: { shippingEmailSent: true } });
    }

    revalidatePath(`/admin/orders/${o.id}`);
    return { ok: true } as const;
  });
}

export async function adminAddOrderNote(input: unknown): Promise<ActionResult<{ ok: true }>> {
  return withErrors(async () => {
    await requireAdmin();
    const parsed = addOrderNoteSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT');
    const o = await db.order.findUnique({ where: { id: parsed.data.orderId } });
    if (!o) throw new AppError('NOT_FOUND');
    const stamp = new Date().toISOString().slice(0, 19);
    const next = (o.notes ? `${o.notes}\n` : '') + `[${stamp}] ${parsed.data.note}`;
    await db.order.update({ where: { id: o.id }, data: { notes: next } });
    revalidatePath(`/admin/orders/${o.id}`);
    return { ok: true } as const;
  });
}

export async function adminMarkRefunded(input: unknown): Promise<ActionResult<{ ok: true }>> {
  return withErrors(async () => {
    await requireAdmin();
    const parsed = markRefundedSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT');

    const o = await db.order.findUnique({ where: { id: parsed.data.orderId }, include: { items: true } });
    if (!o) throw new AppError('NOT_FOUND');
    if (o.paymentStatus !== 'PAID') throw new AppError('CONFLICT', 'Order is not in a refundable state.');

    await db.$transaction(async (tx) => {
      // Restore inventory if not yet delivered
      if (o.status !== 'DELIVERED') {
        for (const item of o.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { inventory: { increment: item.quantity } },
            });
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: { inventory: { increment: item.quantity } },
            });
          }
        }
      }
      const stamp = new Date().toISOString().slice(0, 19);
      await tx.order.update({
        where: { id: o.id },
        data: {
          status: 'REFUNDED',
          paymentStatus: 'REFUNDED',
          refundedAt: new Date(),
          notes: (o.notes ? `${o.notes}\n` : '') + `[${stamp}] REFUND: ${parsed.data.reason}`,
        },
      });
    });

    revalidatePath(`/admin/orders/${o.id}`);
    return { ok: true } as const;
  });
}
