'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { Prisma, EnquiryStatus, EnquiryType } from '@prisma/client';
import { requireAdmin } from '@/lib/auth-guards';
import { withErrors, AppError, type ActionResult } from '@/lib/errors';
import { cuid } from '@/lib/validators/common';

export async function adminListEnquiries(input: unknown): Promise<
  ActionResult<{
    items: Array<{
      id: string;
      type: string;
      status: string;
      name: string;
      email: string;
      phone: string | null;
      message: string | null;
      createdAt: string;
      productTitle: string | null;
    }>;
    total: number;
  }>
> {
  return withErrors(async () => {
    await requireAdmin();
    const schema = z
      .object({
        type: z.nativeEnum(EnquiryType).optional(),
        status: z.nativeEnum(EnquiryStatus).optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      })
      .strict();
    const parsed = schema.safeParse(input ?? {});
    if (!parsed.success) throw new AppError('BAD_INPUT');

    const where: Prisma.EnquiryWhereInput = {};
    if (parsed.data.type) where.type = parsed.data.type;
    if (parsed.data.status) where.status = parsed.data.status;

    const [total, rows] = await db.$transaction([
      db.enquiry.count({ where }),
      db.enquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parsed.data.page - 1) * parsed.data.pageSize,
        take: parsed.data.pageSize,
        include: { product: { select: { title: true } } },
      }),
    ]);

    return {
      total,
      items: rows.map((e) => ({
        id: e.id,
        type: e.type,
        status: e.status,
        name: e.name,
        email: e.email,
        phone: e.phone,
        message: e.message,
        createdAt: e.createdAt.toISOString(),
        productTitle: e.product?.title ?? null,
      })),
    };
  });
}

export async function adminMarkEnquiryStatus(input: unknown): Promise<ActionResult<{ ok: true }>> {
  return withErrors(async () => {
    await requireAdmin();
    const schema = z
      .object({
        id: cuid,
        status: z.nativeEnum(EnquiryStatus),
      })
      .strict();
    const parsed = schema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT');
    const existing = await db.enquiry.findUnique({ where: { id: parsed.data.id } });
    if (!existing) throw new AppError('NOT_FOUND');
    await db.enquiry.update({ where: { id: parsed.data.id }, data: { status: parsed.data.status } });
    revalidatePath('/admin/enquiries');
    return { ok: true } as const;
  });
}

export async function adminGetEnquiry(id: string): Promise<ActionResult<unknown>> {
  return withErrors(async () => {
    await requireAdmin();
    const e = await db.enquiry.findUnique({
      where: { id },
      include: { product: { select: { id: true, title: true, handle: true } } },
    });
    if (!e) throw new AppError('NOT_FOUND');
    return e;
  });
}
