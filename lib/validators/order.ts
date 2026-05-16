import { z } from 'zod';
import { cuid } from './common';

export const orderStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'CRAFTING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]);

export const updateOrderStatusSchema = z
  .object({
    orderId: cuid,
    status: orderStatusSchema,
  })
  .strict();

export const addTrackingSchema = z
  .object({
    orderId: cuid,
    trackingNumber: z.string().trim().min(3).max(80),
    carrier: z.string().trim().max(80).optional().or(z.literal('')),
  })
  .strict();

export const addOrderNoteSchema = z
  .object({
    orderId: cuid,
    note: z.string().trim().min(1).max(2000),
  })
  .strict();

export const markRefundedSchema = z
  .object({
    orderId: cuid,
    reason: z.string().trim().min(3).max(500),
  })
  .strict();

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type AddTrackingInput = z.infer<typeof addTrackingSchema>;
