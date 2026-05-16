'use server';

import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { withErrors, AppError, type ActionResult } from '@/lib/errors';
import { sendEmail } from '@/lib/email';
import { enquiryLimiter } from '@/lib/rate-limit';
import {
  atelierBookingSchema,
  contactFormSchema,
  customEnquirySchema,
  productEnquirySchema,
} from '@/lib/validators/enquiry';
import AtelierBookingEmail from '@/emails/AtelierBooking';
import CustomEnquiryEmail from '@/emails/CustomEnquiry';
import ContactEnquiryEmail from '@/emails/ContactEnquiry';
import ProductEnquiryEmail from '@/emails/ProductEnquiry';

function notifyRecipients(): string[] {
  const main = process.env.EMAIL_NOTIFY_TO ?? '';
  const cc = (process.env.EMAIL_NOTIFY_CC ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const list = [main, ...cc].filter(Boolean);
  return list.length ? list : ['noreply@example.com'];
}

async function rateLimit() {
  const hdrs = await headers();
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? hdrs.get('x-real-ip') ?? 'unknown';
  const res = await enquiryLimiter.check(`enq:${ip}`);
  if (!res.allowed) {
    throw new AppError('RATE_LIMITED', 'Please wait before submitting again.');
  }
}

export async function submitAtelierBooking(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withErrors(async () => {
    const parsed = atelierBookingSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT', 'Please check the form.');
    if (parsed.data.website) return { id: 'bot' }; // honeypot silent drop
    await rateLimit();

    const e = await db.enquiry.create({
      data: {
        type: 'ATELIER_BOOKING',
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        message: parsed.data.interest || null,
        metadata: {
          preferredDate: parsed.data.preferredDate,
          branch: parsed.data.branch,
        },
      },
    });

    await sendEmail({
      to: notifyRecipients(),
      template: 'AtelierBooking',
      subject: `Atelier booking: ${parsed.data.name} (${parsed.data.branch})`,
      payload: parsed.data,
      element: AtelierBookingEmail({ ...parsed.data }),
      replyTo: parsed.data.email,
    });
    return { id: e.id };
  });
}

export async function submitCustomEnquiry(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withErrors(async () => {
    const parsed = customEnquirySchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT');
    if (parsed.data.website) return { id: 'bot' };
    await rateLimit();

    const e = await db.enquiry.create({
      data: {
        type: 'CUSTOM_DESIGN',
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        message: parsed.data.message || null,
        metadata: {
          occasion: parsed.data.occasion,
          budget: parsed.data.budget,
          timeline: parsed.data.timeline,
          referenceImages: parsed.data.referenceImages,
        },
      },
    });

    await sendEmail({
      to: notifyRecipients(),
      template: 'CustomEnquiry',
      subject: `Custom design enquiry from ${parsed.data.name}`,
      payload: parsed.data,
      element: CustomEnquiryEmail({ ...parsed.data }),
      replyTo: parsed.data.email,
    });
    return { id: e.id };
  });
}

export async function submitContactForm(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withErrors(async () => {
    const parsed = contactFormSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT');
    if (parsed.data.website) return { id: 'bot' };
    await rateLimit();

    const e = await db.enquiry.create({
      data: {
        type: 'CONTACT',
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        message: parsed.data.message || null,
        metadata: parsed.data.subject ? { subject: parsed.data.subject } : undefined,
      },
    });

    await sendEmail({
      to: notifyRecipients(),
      template: 'ContactEnquiry',
      subject: parsed.data.subject?.trim() || `Contact from ${parsed.data.name}`,
      payload: parsed.data,
      element: ContactEnquiryEmail({ ...parsed.data }),
      replyTo: parsed.data.email,
    });
    return { id: e.id };
  });
}

export async function submitProductEnquiry(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withErrors(async () => {
    const parsed = productEnquirySchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT');
    if (parsed.data.website) return { id: 'bot' };
    await rateLimit();

    const product = await db.product.findUnique({ where: { id: parsed.data.productId } });
    if (!product || !product.isPublished) throw new AppError('NOT_FOUND', 'Product not found.');

    const e = await db.enquiry.create({
      data: {
        type: 'PRODUCT_ENQUIRY',
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        message: parsed.data.message || null,
        productId: product.id,
      },
    });

    await sendEmail({
      to: notifyRecipients(),
      template: 'ProductEnquiry',
      subject: `Product enquiry: ${product.title}`,
      payload: { ...parsed.data, product: { id: product.id, title: product.title, handle: product.handle } },
      element: ProductEnquiryEmail({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone ?? undefined,
        message: parsed.data.message ?? undefined,
        productTitle: product.title,
        productHandle: product.handle,
      }),
      replyTo: parsed.data.email,
    });
    return { id: e.id };
  });
}
