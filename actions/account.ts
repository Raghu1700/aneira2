'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth-guards';
import { withErrors, AppError, type ActionResult } from '@/lib/errors';
import { updateProfileSchema } from '@/lib/validators/account';

export async function getProfile(): Promise<
  ActionResult<{ id: string; email: string; name: string | null; phone: string | null }>
> {
  return withErrors(async () => {
    const user = await requireUser();
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, phone: true },
    });
    if (!dbUser) throw new AppError('NOT_FOUND');
    return dbUser;
  });
}

export async function updateProfile(input: unknown): Promise<ActionResult<{ ok: true }>> {
  return withErrors(async () => {
    const parsed = updateProfileSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT');
    const user = await requireUser();
    await db.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name ?? undefined,
        phone: parsed.data.phone || undefined,
      },
    });
    revalidatePath('/account/profile');
    return { ok: true } as const;
  });
}

export async function listMyOrders(): Promise<
  ActionResult<
    Array<{
      id: string;
      orderNumber: string;
      status: string;
      paymentStatus: string;
      total: string;
      createdAt: string;
      itemCount: number;
    }>
  >
> {
  return withErrors(async () => {
    const user = await requireUser();
    const rows = await db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { items: { select: { quantity: true } } },
    });
    return rows.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      total: o.total.toString(),
      createdAt: o.createdAt.toISOString(),
      itemCount: o.items.reduce((acc, i) => acc + i.quantity, 0),
    }));
  });
}

export async function getMyOrder(orderId: string): Promise<
  ActionResult<{
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    email: string;
    phone: string;
    subtotal: string;
    shippingCost: string;
    gstAmount: string;
    total: string;
    trackingNumber: string | null;
    carrier: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
    createdAt: string;
    ship: {
      fullName: string;
      phone: string;
      line1: string;
      line2: string | null;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
    items: Array<{
      id: string;
      title: string;
      imageUrl: string | null;
      price: string;
      quantity: number;
      lineTotal: string;
    }>;
  }>
> {
  return withErrors(async () => {
    const user = await requireUser();
    const o = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!o || (o.userId && o.userId !== user.id)) throw new AppError('NOT_FOUND');

    return {
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      email: o.email,
      phone: o.phone,
      subtotal: o.subtotal.toString(),
      shippingCost: o.shippingCost.toString(),
      gstAmount: o.gstAmount.toString(),
      total: o.total.toString(),
      trackingNumber: o.trackingNumber,
      carrier: o.carrier,
      shippedAt: o.shippedAt?.toISOString() ?? null,
      deliveredAt: o.deliveredAt?.toISOString() ?? null,
      createdAt: o.createdAt.toISOString(),
      ship: {
        fullName: o.shipFullName,
        phone: o.shipPhone,
        line1: o.shipLine1,
        line2: o.shipLine2,
        city: o.shipCity,
        state: o.shipState,
        pincode: o.shipPincode,
        country: o.shipCountry,
      },
      items: o.items.map((it) => ({
        id: it.id,
        title: it.titleSnapshot,
        imageUrl: it.imageUrlSnapshot,
        price: it.priceSnapshot.toString(),
        quantity: it.quantity,
        lineTotal: it.lineTotal.toString(),
      })),
    };
  });
}
