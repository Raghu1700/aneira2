import { z } from 'zod';
import { addressSchema } from './address';
import { email, indianPhone } from './common';

export const checkoutContactSchema = z
  .object({
    email,
    phone: indianPhone,
  })
  .strict();

export const checkoutInputSchema = z
  .object({
    contact: checkoutContactSchema,
    shipping: addressSchema.omit({ isDefault: true }),
  })
  .strict();

export const verifyOrderSchema = z
  .object({
    razorpay_order_id: z.string().min(8).max(64),
    razorpay_payment_id: z.string().min(8).max(64),
    razorpay_signature: z.string().regex(/^[0-9a-f]{64}$/i, 'Invalid signature'),
  })
  .strict();

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;
export type VerifyOrderInput = z.infer<typeof verifyOrderSchema>;
