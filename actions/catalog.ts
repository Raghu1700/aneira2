'use server';

import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { withErrors, AppError, type ActionResult } from '@/lib/errors';
import { productSearchSchema } from '@/lib/validators/product';

export interface ProductCardDTO {
  id: string;
  handle: string;
  title: string;
  price: string;
  compareAtPrice: string | null;
  imageUrl: string | null;
  imageAltText: string | null;
  isFeatured: boolean;
  tags: string[];
}

export async function listCollections(): Promise<
  ActionResult<
    Array<{ id: string; handle: string; title: string; description: string | null; heroImageUrl: string | null }>
  >
> {
  return withErrors(async () => {
    const rows = await db.collection.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
      select: { id: true, handle: true, title: true, description: true, heroImageUrl: true },
    });
    return rows;
  });
}

export async function getCollection(handle: string): Promise<
  ActionResult<{
    id: string;
    handle: string;
    title: string;
    description: string | null;
    heroImageUrl: string | null;
  }>
> {
  return withErrors(async () => {
    const c = await db.collection.findUnique({
      where: { handle },
      select: { id: true, handle: true, title: true, description: true, heroImageUrl: true, isPublished: true },
    });
    if (!c || !c.isPublished) throw new AppError('NOT_FOUND');
    return { id: c.id, handle: c.handle, title: c.title, description: c.description, heroImageUrl: c.heroImageUrl };
  });
}

export async function searchProducts(input: unknown): Promise<
  ActionResult<{
    items: ProductCardDTO[];
    total: number;
    page: number;
    pageSize: number;
  }>
> {
  return withErrors(async () => {
    const parsed = productSearchSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT');

    const where: Prisma.ProductWhereInput = { isPublished: true };

    if (parsed.data.collection) {
      const c = await db.collection.findUnique({ where: { handle: parsed.data.collection } });
      if (!c || !c.isPublished) {
        return { items: [], total: 0, page: parsed.data.page, pageSize: parsed.data.pageSize };
      }
      where.collectionId = c.id;
    }

    if (parsed.data.q) {
      const q = parsed.data.q.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { shortDescription: { contains: q, mode: 'insensitive' } },
        { tags: { has: q.toLowerCase() } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[];
    switch (parsed.data.sort) {
      case 'price_asc':
        orderBy = { basePrice: 'asc' };
        break;
      case 'price_desc':
        orderBy = { basePrice: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'featured':
      default:
        orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
    }

    const [total, rows] = await db.$transaction([
      db.product.count({ where }),
      db.product.findMany({
        where,
        orderBy,
        skip: (parsed.data.page - 1) * parsed.data.pageSize,
        take: parsed.data.pageSize,
        include: { images: { orderBy: { order: 'asc' }, take: 1 } },
      }),
    ]);

    return {
      items: rows.map((p) => ({
        id: p.id,
        handle: p.handle,
        title: p.title,
        price: p.basePrice.toString(),
        compareAtPrice: p.compareAtPrice?.toString() ?? null,
        imageUrl: p.images[0]?.url ?? null,
        imageAltText: p.images[0]?.altText ?? null,
        isFeatured: p.isFeatured,
        tags: p.tags,
      })),
      total,
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
    };
  });
}

export async function getProduct(handle: string): Promise<
  ActionResult<{
    id: string;
    handle: string;
    title: string;
    shortDescription: string;
    longDescription: string | null;
    basePrice: string;
    compareAtPrice: string | null;
    metal: string | null;
    grossWeightG: string | null;
    stones: string | null;
    dimensions: string | null;
    hallmark: string | null;
    certification: string | null;
    tags: string[];
    isFeatured: boolean;
    inventory: number;
    collection: { handle: string; title: string };
    images: Array<{ url: string; altText: string; width: number; height: number }>;
    variants: Array<{ id: string; title: string; price: string; inventory: number; isAvailable: boolean }>;
  }>
> {
  return withErrors(async () => {
    const p = await db.product.findUnique({
      where: { handle },
      include: {
        images: { orderBy: { order: 'asc' } },
        variants: true,
        collection: { select: { handle: true, title: true } },
      },
    });
    if (!p || !p.isPublished) throw new AppError('NOT_FOUND');

    return {
      id: p.id,
      handle: p.handle,
      title: p.title,
      shortDescription: p.shortDescription,
      longDescription: p.longDescription,
      basePrice: p.basePrice.toString(),
      compareAtPrice: p.compareAtPrice?.toString() ?? null,
      metal: p.metal,
      grossWeightG: p.grossWeightG?.toString() ?? null,
      stones: p.stones,
      dimensions: p.dimensions,
      hallmark: p.hallmark,
      certification: p.certification,
      tags: p.tags,
      isFeatured: p.isFeatured,
      inventory: p.inventory,
      collection: p.collection,
      images: p.images.map((i) => ({
        url: i.url,
        altText: i.altText,
        width: i.width,
        height: i.height,
      })),
      variants: p.variants.map((v) => ({
        id: v.id,
        title: v.title,
        price: (v.priceOverride ?? p.basePrice).toString(),
        inventory: v.inventory,
        isAvailable: v.isAvailable,
      })),
    };
  });
}

export async function getRelatedProducts(productId: string, limit = 4): Promise<ActionResult<ProductCardDTO[]>> {
  return withErrors(async () => {
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product || !product.isPublished) return [];
    const rows = await db.product.findMany({
      where: {
        isPublished: true,
        collectionId: product.collectionId,
        NOT: { id: productId },
      },
      take: limit,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: { images: { orderBy: { order: 'asc' }, take: 1 } },
    });
    return rows.map((p) => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      price: p.basePrice.toString(),
      compareAtPrice: p.compareAtPrice?.toString() ?? null,
      imageUrl: p.images[0]?.url ?? null,
      imageAltText: p.images[0]?.altText ?? null,
      isFeatured: p.isFeatured,
      tags: p.tags,
    }));
  });
}

export async function getFeaturedProducts(limit = 8): Promise<ActionResult<ProductCardDTO[]>> {
  return withErrors(async () => {
    const rows = await db.product.findMany({
      where: { isPublished: true, isFeatured: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { images: { orderBy: { order: 'asc' }, take: 1 } },
    });
    return rows.map((p) => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      price: p.basePrice.toString(),
      compareAtPrice: p.compareAtPrice?.toString() ?? null,
      imageUrl: p.images[0]?.url ?? null,
      imageAltText: p.images[0]?.altText ?? null,
      isFeatured: p.isFeatured,
      tags: p.tags,
    }));
  });
}
