'use server';

import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guards';
import { withErrors, AppError, type ActionResult } from '@/lib/errors';

export async function adminListCustomers(input: unknown): Promise<
  ActionResult<{
    items: Array<{
      id: string;
      email: string;
      name: string | null;
      phone: string | null;
      orderCount: number;
      lifetimeValue: string;
      createdAt: string;
      lastLoginAt: string | null;
    }>;
    total: number;
  }>
> {
  return withErrors(async () => {
    await requireAdmin();
    const schema = z
      .object({
        q: z.string().trim().max(80).optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      })
      .strict();
    const parsed = schema.safeParse(input ?? {});
    if (!parsed.success) throw new AppError('BAD_INPUT');

    const where: Prisma.UserWhereInput = { role: 'CUSTOMER' };
    if (parsed.data.q) {
      where.OR = [
        { email: { contains: parsed.data.q, mode: 'insensitive' } },
        { name: { contains: parsed.data.q, mode: 'insensitive' } },
        { phone: { contains: parsed.data.q } },
      ];
    }

    const [total, rows] = await db.$transaction([
      db.user.count({ where }),
      db.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parsed.data.page - 1) * parsed.data.pageSize,
        take: parsed.data.pageSize,
        include: {
          orders: { where: { paymentStatus: 'PAID' }, select: { total: true } },
        },
      }),
    ]);

    return {
      total,
      items: rows.map((u) => {
        const ltv = u.orders.reduce(
          (acc, o) => acc.add(new Prisma.Decimal(o.total as unknown as string)),
          new Prisma.Decimal(0),
        );
        return {
          id: u.id,
          email: u.email,
          name: u.name ?? null,
          phone: u.phone ?? null,
          orderCount: u.orders.length,
          lifetimeValue: ltv.toFixed(2),
          createdAt: u.createdAt.toISOString(),
          lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
        };
      }),
    };
  });
}

export async function adminGetCustomer(id: string): Promise<ActionResult<unknown>> {
  return withErrors(async () => {
    await requireAdmin();
    const u = await db.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: { orderBy: { createdAt: 'desc' } },
        wishlist: { include: { product: { select: { id: true, title: true, handle: true } } } },
      },
    });
    if (!u || u.role !== 'CUSTOMER') throw new AppError('NOT_FOUND');
    return u;
  });
}
