'use server';

import { Decimal } from 'decimal.js';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { withErrors, AppError, type ActionResult } from '@/lib/errors';
import { checkoutInputSchema, verifyOrderSchema } from '@/lib/validators/checkout';
import { readCartToken, clearCartToken } from '@/lib/cart-token';
import { getSessionUser } from '@/lib/auth-guards';
import { computeOrderTotals, toPaise } from '@/lib/money';
import { createRazorpayOrder, verifyPaymentSignature } from '@/lib/razorpay';
import { generateNextOrderNumber } from '@/lib/order-number';
import { sendEmail } from '@/lib/email';
import { logger } from '@/lib/logger';
import { checkoutLimiter } from '@/lib/rate-limit';
import { headers } from 'next/headers';
import OrderConfirmationEmail from '@/emails/OrderConfirmation';
import AdminOrderNotificationEmail from '@/emails/AdminOrderNotification';

async function rateLimit() {
  const hdrs = await headers();
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? hdrs.get('x-real-ip') ?? 'unknown';
  const res = await checkoutLimiter.check(`checkout:${ip}`);
  if (!res.allowed) throw new AppError('RATE_LIMITED');
}

async function loadSettings() {
  const s = await db.setting.findUnique({ where: { id: 1 } });
  if (!s) throw new AppError('INTERNAL', 'Store settings missing.');
  return {
    gstRate: new Decimal(s.gstRate as unknown as string),
    freeShippingMin: new Decimal(s.freeShippingMin as unknown as string),
    flatRate: new Decimal(s.flatRate as unknown as string),
  };
}

interface QuotedCart {
  cartId: string;
  lines: Array<{
    cartItemId: string;
    productId: string;
    variantId: string | null;
    title: string;
    imageUrl: string | null;
    quantity: number;
    price: Decimal;
    inventory: number;
  }>;
  subtotal: Decimal;
  shipping: Decimal;
  gstRate: Decimal;
  gstAmount: Decimal;
  total: Decimal;
}

async function quoteCart(): Promise<QuotedCart> {
  const token = await readCartToken();
  if (!token) throw new AppError('NOT_FOUND', 'Your cart is empty.');
  const cart = await db.cart.findUnique({
    where: { token },
    include: {
      items: {
        include: {
          product: { include: { images: { orderBy: { order: 'asc' }, take: 1 } } },
          variant: true,
        },
      },
    },
  });
  if (!cart || cart.items.length === 0) throw new AppError('NOT_FOUND', 'Your cart is empty.');

  const lines = cart.items.map((it) => {
    const price = it.variant?.priceOverride
      ? new Decimal(it.variant.priceOverride as unknown as string)
      : new Decimal(it.product.basePrice as unknown as string);
    return {
      cartItemId: it.id,
      productId: it.productId,
      variantId: it.variantId ?? null,
      title: it.product.title,
      imageUrl: it.product.images[0]?.url ?? null,
      quantity: it.quantity,
      price,
      inventory: it.variant?.inventory ?? it.product.inventory,
    };
  });

  const settings = await loadSettings();
  const totals = computeOrderTotals({
    lines: lines.map((l) => ({ price: l.price, quantity: l.quantity })),
    gstRate: settings.gstRate,
    shipping: { freeShippingMin: settings.freeShippingMin, flatRate: settings.flatRate },
  });

  return {
    cartId: cart.id,
    lines,
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    gstRate: totals.gstRate,
    gstAmount: totals.gstAmount,
    total: totals.total,
  };
}

export async function createCheckoutDraft(): Promise<
  ActionResult<{
    items: Array<{ title: string; quantity: number; price: string; lineTotal: string; imageUrl: string | null }>;
    subtotal: string;
    shipping: string;
    gst: string;
    gstRate: string;
    total: string;
  }>
> {
  return withErrors(async () => {
    const q = await quoteCart();
    // basic stock sanity
    for (const l of q.lines) {
      if (l.inventory < l.quantity) throw new AppError('OUT_OF_STOCK', `${l.title} is no longer available.`);
    }
    return {
      items: q.lines.map((l) => ({
        title: l.title,
        quantity: l.quantity,
        price: l.price.toFixed(2),
        lineTotal: l.price.mul(l.quantity).toFixed(2),
        imageUrl: l.imageUrl,
      })),
      subtotal: q.subtotal.toFixed(2),
      shipping: q.shipping.toFixed(2),
      gst: q.gstAmount.toFixed(2),
      gstRate: q.gstRate.toString(),
      total: q.total.toFixed(2),
    };
  });
}

export async function createRazorpayCheckoutOrder(input: unknown): Promise<
  ActionResult<{
    razorpayOrderId: string;
    keyId: string;
    amount: number;
    currency: string;
    orderNumber: string;
    internalOrderId: string;
  }>
> {
  return withErrors(async () => {
    await rateLimit();
    const parsed = checkoutInputSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT', 'Please check the checkout form.');

    const user = await getSessionUser();
    const q = await quoteCart();

    const txResult = await db.$transaction(
      async (tx) => {
        // Pessimistic lock + re-fetch inventory inside transaction
        const lockIds = q.lines.map((l) => l.variantId ?? l.productId);
        await tx.$queryRaw(
          Prisma.sql`SELECT id FROM "Product" WHERE id IN (${Prisma.join(
            q.lines.map((l) => l.productId),
          )}) FOR UPDATE`,
        );
        if (q.lines.some((l) => l.variantId)) {
          await tx.$queryRaw(
            Prisma.sql`SELECT id FROM "ProductVariant" WHERE id IN (${Prisma.join(
              q.lines.filter((l) => !!l.variantId).map((l) => l.variantId as string),
            )}) FOR UPDATE`,
          );
        }

        // Re-read inventory and decrement atomically
        for (const l of q.lines) {
          if (l.variantId) {
            const v = await tx.productVariant.findUnique({ where: { id: l.variantId } });
            if (!v || !v.isAvailable || v.inventory < l.quantity) {
              throw new AppError('OUT_OF_STOCK', `${l.title} is no longer available.`);
            }
            await tx.productVariant.update({
              where: { id: l.variantId },
              data: { inventory: v.inventory - l.quantity },
            });
          } else {
            const p = await tx.product.findUnique({ where: { id: l.productId } });
            if (!p || !p.isPublished || p.inventory < l.quantity) {
              throw new AppError('OUT_OF_STOCK', `${l.title} is no longer available.`);
            }
            await tx.product.update({
              where: { id: l.productId },
              data: { inventory: p.inventory - l.quantity },
            });
          }
        }

        const orderNumber = await generateNextOrderNumber();

        const order = await tx.order.create({
          data: {
            orderNumber,
            userId: user?.id ?? null,
            email: parsed.data.contact.email,
            phone: parsed.data.contact.phone,
            subtotal: q.subtotal.toString(),
            shippingCost: q.shipping.toString(),
            gstRate: q.gstRate.toString(),
            gstAmount: q.gstAmount.toString(),
            total: q.total.toString(),
            shipFullName: parsed.data.shipping.fullName,
            shipPhone: parsed.data.shipping.phone,
            shipLine1: parsed.data.shipping.line1,
            shipLine2: parsed.data.shipping.line2 || null,
            shipCity: parsed.data.shipping.city,
            shipState: parsed.data.shipping.state,
            shipPincode: parsed.data.shipping.pincode,
            shipCountry: parsed.data.shipping.country,
            items: {
              create: q.lines.map((l) => ({
                productId: l.productId,
                variantId: l.variantId,
                titleSnapshot: l.title,
                imageUrlSnapshot: l.imageUrl,
                priceSnapshot: l.price.toString(),
                quantity: l.quantity,
                lineTotal: l.price.mul(l.quantity).toString(),
                gstAmount: l.price.mul(l.quantity).mul(q.gstRate).toDecimalPlaces(2).toString(),
              })),
            },
          },
        });

        return { order, orderNumber, cartId: q.cartId };
      },
      { isolationLevel: 'Serializable', timeout: 10_000, maxWait: 5_000 },
    );

    const rzpOrder = await createRazorpayOrder({
      amount: toPaise(q.total),
      receipt: txResult.orderNumber,
      currency: 'INR',
      notes: { internalOrderId: txResult.order.id, orderNumber: txResult.orderNumber },
    });

    await db.order.update({
      where: { id: txResult.order.id },
      data: { razorpayOrderId: rzpOrder.id },
    });

    return {
      razorpayOrderId: rzpOrder.id,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      orderNumber: txResult.orderNumber,
      internalOrderId: txResult.order.id,
    };
  });
}

export async function verifyAndCompleteOrder(input: unknown): Promise<
  ActionResult<{ orderNumber: string; internalOrderId: string }>
> {
  return withErrors(async () => {
    const parsed = verifyOrderSchema.safeParse(input);
    if (!parsed.success) throw new AppError('PAYMENT_INVALID', 'Invalid payment payload.');

    const ok = verifyPaymentSignature({
      orderId: parsed.data.razorpay_order_id,
      paymentId: parsed.data.razorpay_payment_id,
      signature: parsed.data.razorpay_signature,
    });
    if (!ok) throw new AppError('PAYMENT_INVALID', 'Could not verify payment.');

    const order = await db.order.findUnique({
      where: { razorpayOrderId: parsed.data.razorpay_order_id },
      include: { items: true },
    });
    if (!order) throw new AppError('NOT_FOUND', 'Order not found.');

    // Idempotent: if already PAID, do nothing but return success.
    if (order.paymentStatus === 'PAID') {
      return { orderNumber: order.orderNumber, internalOrderId: order.id };
    }

    const updated = await db.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        razorpayPaymentId: parsed.data.razorpay_payment_id,
        razorpaySignature: parsed.data.razorpay_signature,
      },
      include: { items: true },
    });

    // Clear cart (best effort)
    try {
      const token = await readCartToken();
      if (token) {
        const cart = await db.cart.findUnique({ where: { token } });
        if (cart) await db.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    } catch (err) {
      logger.warn({ err }, 'cart clear after payment failed (non-fatal)');
    }

    // Send emails best-effort
    if (!updated.confirmationEmailSent) {
      await sendEmail({
        to: updated.email,
        template: 'OrderConfirmation',
        subject: `Order confirmed — ${updated.orderNumber}`,
        payload: { orderId: updated.id },
        element: OrderConfirmationEmail({
          orderNumber: updated.orderNumber,
          customerName: updated.shipFullName,
          items: updated.items.map((it) => ({
            title: it.titleSnapshot,
            quantity: it.quantity,
            price: it.priceSnapshot.toString(),
            lineTotal: it.lineTotal.toString(),
            imageUrl: it.imageUrlSnapshot,
          })),
          subtotal: updated.subtotal.toString(),
          shipping: updated.shippingCost.toString(),
          gst: updated.gstAmount.toString(),
          total: updated.total.toString(),
          shippingAddress: {
            fullName: updated.shipFullName,
            line1: updated.shipLine1,
            line2: updated.shipLine2,
            city: updated.shipCity,
            state: updated.shipState,
            pincode: updated.shipPincode,
            country: updated.shipCountry,
          },
        }),
      });

      const notifyTo = process.env.EMAIL_NOTIFY_TO ?? '';
      if (notifyTo) {
        await sendEmail({
          to: notifyTo,
          template: 'AdminOrderNotification',
          subject: `New order: ${updated.orderNumber} (₹${updated.total})`,
          payload: { orderId: updated.id },
          element: AdminOrderNotificationEmail({
            orderNumber: updated.orderNumber,
            total: updated.total.toString(),
            customerEmail: updated.email,
            customerName: updated.shipFullName,
            items: updated.items.map((it) => ({
              title: it.titleSnapshot,
              quantity: it.quantity,
              lineTotal: it.lineTotal.toString(),
            })),
          }),
        });
      }

      await db.order.update({
        where: { id: updated.id },
        data: { confirmationEmailSent: true },
      });
    }

    return { orderNumber: updated.orderNumber, internalOrderId: updated.id };
  });
}
