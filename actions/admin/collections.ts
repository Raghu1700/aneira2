'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guards';
import { withErrors, AppError, type ActionResult } from '@/lib/errors';
import {
  collectionCreateSchema,
  collectionIdSchema,
  collectionUpdateSchema,
  reorderCollectionsSchema,
} from '@/lib/validators/collection';

export async function adminListCollections(): Promise<
  ActionResult<
    Array<{
      id: string;
      handle: string;
      title: string;
      description: string | null;
      heroImageUrl: string | null;
      isPublished: boolean;
      order: number;
      productCount: number;
    }>
  >
> {
  return withErrors(async () => {
    await requireAdmin();
    const rows = await db.collection.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      handle: r.handle,
      title: r.title,
      description: r.description,
      heroImageUrl: r.heroImageUrl,
      isPublished: r.isPublished,
      order: r.order,
      productCount: r._count.products,
    }));
  });
}

export async function adminCreateCollection(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withErrors(async () => {
    await requireAdmin();
    const parsed = collectionCreateSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT');
    const existing = await db.collection.findUnique({ where: { handle: parsed.data.handle } });
    if (existing) throw new AppError('CONFLICT', 'A collection with this handle exists.');
    const c = await db.collection.create({
      data: {
        handle: parsed.data.handle,
        title: parsed.data.title,
        description: parsed.data.description || null,
        heroImageUrl: parsed.data.heroImageUrl || null,
        order: parsed.data.order,
        isPublished: parsed.data.isPublished,
      },
    });
    revalidatePath('/admin/collections');
    return { id: c.id };
  });
}

export async function adminUpdateCollection(input: unknown): Promise<ActionResult<{ ok: true }>> {
  return withErrors(async () => {
    await requireAdmin();
    const parsed = collectionUpdateSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT');
    const { id, ...rest } = parsed.data;
    const existing = await db.collection.findUnique({ where: { id } });
    if (!existing) throw new AppError('NOT_FOUND');
    await db.collection.update({ where: { id }, data: rest });
    revalidatePath('/admin/collections');
    revalidatePath(`/collections/${existing.handle}`);
    return { ok: true } as const;
  });
}

export async function adminDeleteCollection(input: unknown): Promise<ActionResult<{ ok: true }>> {
  return withErrors(async () => {
    await requireAdmin();
    const parsed = collectionIdSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT');
    const count = await db.product.count({ where: { collectionId: parsed.data.id } });
    if (count > 0) throw new AppError('CONFLICT', 'Move or delete products in this collection first.');
    await db.collection.delete({ where: { id: parsed.data.id } });
    revalidatePath('/admin/collections');
    return { ok: true } as const;
  });
}

export async function adminReorderCollections(input: unknown): Promise<ActionResult<{ ok: true }>> {
  return withErrors(async () => {
    await requireAdmin();
    const parsed = reorderCollectionsSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT');
    await db.$transaction(
      parsed.data.order.map((o) =>
        db.collection.update({ where: { id: o.id }, data: { order: o.order } }),
      ),
    );
    revalidatePath('/admin/collections');
    return { ok: true } as const;
  });
}
