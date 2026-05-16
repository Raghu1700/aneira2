'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth-guards';
import { withErrors, AppError, type ActionResult } from '@/lib/errors';
import { cuid } from '@/lib/validators/common';

const toggleSchema = z.object({ productId: cuid }).strict();

export async function toggleWishlist(input: unknown): Promise<ActionResult<{ inWishlist: boolean }>> {
  return withErrors(async () => {
    const parsed = toggleSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT');
    const user = await requireUser();

    const existing = await db.wishlistItem.findUnique({
      where: { userId_productId: { userId: user.id, productId: parsed.data.productId } },
    });
    if (existing) {
      await db.wishlistItem.delete({ where: { id: existing.id } });
      revalidatePath('/account/wishlist');
      return { inWishlist: false };
    }

    const product = await db.product.findUnique({
      where: { id: parsed.data.productId },
      select: { id: true, isPublished: true },
    });
    if (!product || !product.isPublished) throw new AppError('NOT_FOUND');

    await db.wishlistItem.create({
      data: { userId: user.id, productId: product.id },
    });
    revalidatePath('/account/wishlist');
    return { inWishlist: true };
  });
}

export async function getWishlist(): Promise<
  ActionResult<
    Array<{ id: string; productId: string; title: string; handle: string; price: string; imageUrl: string | null }>
  >
> {
  return withErrors(async () => {
    const user = await requireUser();
    const items = await db.wishlistItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: { images: { orderBy: { order: 'asc' }, take: 1 } },
        },
      },
    });
    return items
      .filter((i) => i.product.isPublished)
      .map((i) => ({
        id: i.id,
        productId: i.productId,
        title: i.product.title,
        handle: i.product.handle,
        price: i.product.basePrice.toString(),
        imageUrl: i.product.images[0]?.url ?? null,
      }));
  });
}

export async function isInWishlist(productId: string): Promise<boolean> {
  const user = await requireUser().catch(() => null);
  if (!user) return false;
  const item = await db.wishlistItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });
  return !!item;
}
