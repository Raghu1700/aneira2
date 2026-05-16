'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth-guards';
import { withErrors, AppError, type ActionResult } from '@/lib/errors';
import {
  productBulkSchema,
  productCreateSchema,
  productIdSchema,
  productUpdateSchema,
} from '@/lib/validators/product';

const SAFE_HTML_OPTS: sanitizeHtml.IOptions = {
  allowedTags: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li'],
  allowedAttributes: { a: ['href', 'rel', 'target'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener', target: '_blank' }) },
};

function clean(html: string | null | undefined): string | null {
  if (!html) return null;
  const out = sanitizeHtml(html, SAFE_HTML_OPTS).trim();
  return out.length ? out : null;
}

export async function adminListProducts(input: unknown): Promise<
  ActionResult<{
    items: Array<{
      id: string;
      handle: string;
      title: string;
      basePrice: string;
      inventory: number;
      isPublished: boolean;
      isFeatured: boolean;
      collectionTitle: string;
      imageUrl: string | null;
      updatedAt: string;
    }>;
    total: number;
  }>
> {
  return withErrors(async () => {
    await requireAdmin();
    const schema = z.object({
      q: z.string().trim().max(80).optional(),
      collectionId: z.string().optional(),
      isPublished: z.boolean().optional(),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(100).default(20),
    });
    const parsed = schema.safeParse(input ?? {});
    if (!parsed.success) throw new AppError('BAD_INPUT');

    const where: Prisma.ProductWhereInput = {};
    if (parsed.data.q) {
      where.OR = [
        { title: { contains: parsed.data.q, mode: 'insensitive' } },
        { handle: { contains: parsed.data.q, mode: 'insensitive' } },
      ];
    }
    if (parsed.data.collectionId) where.collectionId = parsed.data.collectionId;
    if (parsed.data.isPublished !== undefined) where.isPublished = parsed.data.isPublished;

    const [total, rows] = await db.$transaction([
      db.product.count({ where }),
      db.product.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (parsed.data.page - 1) * parsed.data.pageSize,
        take: parsed.data.pageSize,
        include: {
          collection: { select: { title: true } },
          images: { orderBy: { order: 'asc' }, take: 1 },
        },
      }),
    ]);

    return {
      total,
      items: rows.map((r) => ({
        id: r.id,
        handle: r.handle,
        title: r.title,
        basePrice: r.basePrice.toString(),
        inventory: r.inventory,
        isPublished: r.isPublished,
        isFeatured: r.isFeatured,
        collectionTitle: r.collection.title,
        imageUrl: r.images[0]?.url ?? null,
        updatedAt: r.updatedAt.toISOString(),
      })),
    };
  });
}

export async function adminGetProduct(id: string): Promise<ActionResult<unknown>> {
  return withErrors(async () => {
    await requireAdmin();
    const p = await db.product.findUnique({
      where: { id },
      include: { images: { orderBy: { order: 'asc' } }, variants: true },
    });
    if (!p) throw new AppError('NOT_FOUND');
    return p;
  });
}

export async function adminCreateProduct(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withErrors(async () => {
    await requireAdmin();
    const parsed = productCreateSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT', 'Form invalid.', flatten(parsed.error));

    const collection = await db.collection.findUnique({ where: { id: parsed.data.collectionId } });
    if (!collection) throw new AppError('NOT_FOUND', 'Collection not found.');

    const existing = await db.product.findUnique({ where: { handle: parsed.data.handle } });
    if (existing) throw new AppError('CONFLICT', 'A product with this handle already exists.');

    const created = await db.product.create({
      data: {
        handle: parsed.data.handle,
        title: parsed.data.title,
        shortDescription: parsed.data.shortDescription,
        longDescription: clean(parsed.data.longDescription || null),
        collectionId: parsed.data.collectionId,
        basePrice: parsed.data.basePrice,
        compareAtPrice: parsed.data.compareAtPrice || null,
        metal: parsed.data.metal || null,
        grossWeightG: parsed.data.grossWeightG || null,
        stones: parsed.data.stones || null,
        dimensions: parsed.data.dimensions || null,
        hallmark: parsed.data.hallmark || null,
        certification: parsed.data.certification || null,
        tags: parsed.data.tags,
        isPublished: parsed.data.isPublished,
        isFeatured: parsed.data.isFeatured,
        inventory: parsed.data.inventory,
        images: { create: parsed.data.images },
        variants: {
          create: parsed.data.variants.map((v) => ({
            title: v.title,
            priceOverride: v.priceOverride || null,
            inventory: v.inventory,
            isAvailable: v.isAvailable,
          })),
        },
      },
    });

    revalidatePath('/admin/products');
    revalidatePath('/collections');
    return { id: created.id };
  });
}

export async function adminUpdateProduct(input: unknown): Promise<ActionResult<{ ok: true }>> {
  return withErrors(async () => {
    await requireAdmin();
    const parsed = productUpdateSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT', 'Form invalid.', flatten(parsed.error));
    const { id, images, variants, longDescription, ...rest } = parsed.data;

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) throw new AppError('NOT_FOUND');

    await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          ...rest,
          longDescription: longDescription !== undefined ? clean(longDescription || null) : undefined,
        },
      });
      if (images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (images.length) {
          await tx.productImage.createMany({
            data: images.map((im) => ({ ...im, productId: id })),
          });
        }
      }
      if (variants) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        if (variants.length) {
          await tx.productVariant.createMany({
            data: variants.map((v) => ({
              productId: id,
              title: v.title,
              priceOverride: v.priceOverride || null,
              inventory: v.inventory,
              isAvailable: v.isAvailable,
            })),
          });
        }
      }
    });

    revalidatePath('/admin/products');
    revalidatePath(`/products/${existing.handle}`);
    return { ok: true } as const;
  });
}

export async function adminDeleteProduct(input: unknown): Promise<ActionResult<{ ok: true }>> {
  return withErrors(async () => {
    await requireAdmin();
    const parsed = productIdSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT');
    // FK check: cannot delete if referenced by OrderItem with onDelete: Restrict
    const orderCount = await db.orderItem.count({ where: { productId: parsed.data.id } });
    if (orderCount > 0) {
      // soft-delete via unpublish
      await db.product.update({
        where: { id: parsed.data.id },
        data: { isPublished: false, isFeatured: false },
      });
    } else {
      await db.product.delete({ where: { id: parsed.data.id } });
    }
    revalidatePath('/admin/products');
    return { ok: true } as const;
  });
}

export async function adminBulkPublish(input: unknown): Promise<ActionResult<{ count: number }>> {
  return withErrors(async () => {
    await requireAdmin();
    const schema = productBulkSchema.extend({ value: z.boolean() }).strict();
    const parsed = schema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT');
    const r = await db.product.updateMany({
      where: { id: { in: parsed.data.ids } },
      data: { isPublished: parsed.data.value },
    });
    revalidatePath('/admin/products');
    return { count: r.count };
  });
}

export async function adminBulkDelete(input: unknown): Promise<ActionResult<{ count: number }>> {
  return withErrors(async () => {
    await requireAdmin();
    const parsed = productBulkSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT');
    let count = 0;
    for (const id of parsed.data.ids) {
      const referenced = await db.orderItem.count({ where: { productId: id } });
      if (referenced > 0) {
        await db.product.update({ where: { id }, data: { isPublished: false, isFeatured: false } });
      } else {
        await db.product.delete({ where: { id } });
      }
      count++;
    }
    revalidatePath('/admin/products');
    return { count };
  });
}

function flatten(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const k = issue.path.join('.');
    if (!out[k]) out[k] = issue.message;
  }
  return out;
}
