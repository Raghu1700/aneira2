import { z } from 'zod';
import { cuid, email, honeypot, indianPhone } from './common';

const baseFields = {
  name: z.string().trim().min(2, 'Name is required').max(100),
  email,
  phone: indianPhone.optional().or(z.literal('')),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
  website: honeypot, // honeypot field
};

export const atelierBookingSchema = z
  .object({
    ...baseFields,
    preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date'),
    branch: z.enum(['Alandhur', 'Adambakkam', 'Kovilambakkam']),
    interest: z.string().trim().max(500).optional().or(z.literal('')),
  })
  .strict();

export const customEnquirySchema = z
  .object({
    ...baseFields,
    occasion: z.string().trim().max(120).optional().or(z.literal('')),
    budget: z.enum(['<50k', '50k-150k', '150k-500k', '500k+']).optional(),
    timeline: z.string().trim().max(120).optional().or(z.literal('')),
    referenceImages: z.array(z.string().url()).max(5).default([]),
  })
  .strict();

export const contactFormSchema = z
  .object({
    ...baseFields,
    subject: z.string().trim().max(120).optional().or(z.literal('')),
  })
  .strict();

export const productEnquirySchema = z
  .object({
    ...baseFields,
    productId: cuid,
  })
  .strict();

export type AtelierBookingInput = z.infer<typeof atelierBookingSchema>;
export type CustomEnquiryInput = z.infer<typeof customEnquirySchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type ProductEnquiryInput = z.infer<typeof productEnquirySchema>;
