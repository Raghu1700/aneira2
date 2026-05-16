import { z } from 'zod';
import { email, moneyStr } from './common';

export const updateSettingsSchema = z
  .object({
    companyName: z.string().trim().min(1).max(120).optional(),
    freeShippingMin: moneyStr.optional(),
    flatRate: moneyStr.optional(),
    gstRate: z
      .union([z.number(), z.string()])
      .transform((v) => (typeof v === 'number' ? v.toString() : v.trim()))
      .refine((s) => /^0(\.[0-9]{1,4})?$/.test(s) || s === '1', { message: 'gstRate must be between 0 and 1' })
      .optional(),
    gstInclusive: z.boolean().optional(),
    notifyEmails: z.array(email).max(10).optional(),
    supportPhone: z.string().trim().max(40).optional().or(z.literal('')),
    supportEmail: email.optional().or(z.literal('')),
  })
  .strict();

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
