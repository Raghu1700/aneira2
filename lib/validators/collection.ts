import { z } from 'zod';
import { cuid, slugStr } from './common';

export const collectionCreateSchema = z
  .object({
    handle: slugStr,
    title: z.string().trim().min(1).max(100),
    description: z.string().trim().max(2000).optional().or(z.literal('')),
    heroImageUrl: z.string().url().optional().or(z.literal('')),
    order: z.number().int().min(0).default(0),
    isPublished: z.boolean().default(false),
  })
  .strict();

export const collectionUpdateSchema = collectionCreateSchema.partial().extend({ id: cuid });

export const collectionIdSchema = z.object({ id: cuid }).strict();

export const reorderCollectionsSchema = z
  .object({
    order: z.array(z.object({ id: cuid, order: z.number().int().min(0) })).min(1),
  })
  .strict();

export type CollectionCreateInput = z.infer<typeof collectionCreateSchema>;
export type CollectionUpdateInput = z.infer<typeof collectionUpdateSchema>;
