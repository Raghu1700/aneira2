import { z } from 'zod';
import { cuid, indianPhone, pincode } from './common';

export const addressSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Name is required').max(100),
    phone: indianPhone,
    line1: z.string().trim().min(3, 'Address required').max(200),
    line2: z.string().trim().max(200).optional().or(z.literal('')),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    pincode,
    country: z.string().trim().min(2).max(80).default('India'),
    isDefault: z.boolean().default(false),
  })
  .strict();

export const updateAddressSchema = addressSchema.partial().extend({ id: cuid });

export const addressIdSchema = z.object({ id: cuid }).strict();

export type AddressInput = z.infer<typeof addressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
