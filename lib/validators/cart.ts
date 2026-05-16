import { z } from 'zod';
import { cuid, positiveInt } from './common';

export const addToCartSchema = z
  .object({
    productId: cuid,
    variantId: cuid.optional().nullable(),
    quantity: positiveInt.max(99).default(1),
  })
  .strict();

export const updateCartLineSchema = z
  .object({
    lineId: cuid,
    quantity: z.number().int().min(0).max(99),
  })
  .strict();

export const removeCartLineSchema = z.object({ lineId: cuid }).strict();

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartLineInput = z.infer<typeof updateCartLineSchema>;
export type RemoveCartLineInput = z.infer<typeof removeCartLineSchema>;
