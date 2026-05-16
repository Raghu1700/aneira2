import { z } from 'zod';
import { indianPhone } from './common';

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    phone: indianPhone.optional().or(z.literal('')),
  })
  .strict();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
