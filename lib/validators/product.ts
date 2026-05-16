import { z } from 'zod';
import { cuid, moneyStr, nonNegativeInt, slugStr } from './common';

const imageSchema = z
  .object({
    url: z.string().url(),
    altText: z.string().trim().min(1).max(200),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    order: z.number().int().min(0).default(0),
  })
  .strict();

const variantSchema = z
  .object({
    title: z.string().trim().min(1).max(100),
    priceOverride: moneyStr.optional().nullable(),
    inventory: nonNegativeInt.default(1),
    isAvailable: z.boolean().default(true),
  })
  .strict();

export const productCreateSchema = z
  .object({
    handle: slugStr,
    title: z.string().trim().min(1).max(200),
    shortDescription: z.string().trim().min(1).max(600),
    longDescription: z.string().trim().max(4000).optional().or(z.literal('')),
    collectionId: cuid,
    basePrice: moneyStr,
    compareAtPrice: moneyStr.optional().nullable(),
    metal: z.string().trim().max(80).optional().or(z.literal('')),
    grossWeightG: moneyStr.optional().nullable(),
    stones: z.string().trim().max(200).optional().or(z.literal('')),
    dimensions: z.string().trim().max(200).optional().or(z.literal('')),
    hallmark: z.string().trim().max(80).optional().or(z.literal('')),
    certification: z.string().trim().max(200).optional().or(z.literal('')),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
    isPublished: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    inventory: nonNegativeInt.default(1),
    images: z.array(imageSchema).max(20).default([]),
    variants: z.array(variantSchema).max(20).default([]),
  })
  .strict();

export const productUpdateSchema = productCreateSchema.partial().extend({ id: cuid });

export const productIdSchema = z.object({ id: cuid }).strict();

export const productBulkSchema = z.object({ ids: z.array(cuid).min(1).max(200) }).strict();

export const productSearchSchema = z
  .object({
    q: z.string().trim().max(80).optional(),
    collection: slugStr.optional(),
    sort: z.enum(['featured', 'price_asc', 'price_desc', 'newest']).default('featured'),
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(48).default(12),
  })
  .strict();

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ProductSearchInput = z.infer<typeof productSearchSchema>;
