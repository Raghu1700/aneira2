'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guards';
import { withErrors, AppError, type ActionResult } from '@/lib/errors';
import { updateSettingsSchema } from '@/lib/validators/settings';

export async function adminGetSettings(): Promise<
  ActionResult<{
    companyName: string;
    freeShippingMin: string;
    flatRate: string;
    gstRate: string;
    gstInclusive: boolean;
    notifyEmails: string[];
    supportPhone: string | null;
    supportEmail: string | null;
  }>
> {
  return withErrors(async () => {
    await requireAdmin();
    const s = await db.setting.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
    return {
      companyName: s.companyName,
      freeShippingMin: s.freeShippingMin.toString(),
      flatRate: s.flatRate.toString(),
      gstRate: s.gstRate.toString(),
      gstInclusive: s.gstInclusive,
      notifyEmails: s.notifyEmails,
      supportPhone: s.supportPhone,
      supportEmail: s.supportEmail,
    };
  });
}

export async function adminUpdateSettings(input: unknown): Promise<ActionResult<{ ok: true }>> {
  return withErrors(async () => {
    await requireAdmin();
    const parsed = updateSettingsSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT', 'Form invalid.');
    await db.setting.upsert({
      where: { id: 1 },
      create: { id: 1, ...parsed.data },
      update: parsed.data,
    });
    revalidatePath('/admin/settings');
    return { ok: true } as const;
  });
}

export async function adminDashboardMetrics(): Promise<
  ActionResult<{
    ordersToday: number;
    ordersWeek: number;
    ordersMonth: number;
    revenueMonth: string;
    pendingOrders: number;
    newEnquiries: number;
    lowInventoryCount: number;
  }>
> {
  return withErrors(async () => {
    await requireAdmin();
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(dayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [ordersToday, ordersWeek, ordersMonth, pendingOrders, newEnquiries, lowInventoryCount, monthOrders] =
      await db.$transaction([
        db.order.count({ where: { createdAt: { gte: dayStart } } }),
        db.order.count({ where: { createdAt: { gte: weekStart } } }),
        db.order.count({ where: { createdAt: { gte: monthStart } } }),
        db.order.count({ where: { status: 'PENDING' } }),
        db.enquiry.count({ where: { status: 'NEW' } }),
        db.product.count({ where: { inventory: { lt: 2 }, isPublished: true } }),
        db.order.findMany({
          where: { paymentStatus: 'PAID', createdAt: { gte: monthStart } },
          select: { total: true },
        }),
      ]);

    const revenue = monthOrders.reduce((acc, o) => acc + Number(o.total), 0);

    return {
      ordersToday,
      ordersWeek,
      ordersMonth,
      revenueMonth: revenue.toFixed(2),
      pendingOrders,
      newEnquiries,
      lowInventoryCount,
    };
  });
}
