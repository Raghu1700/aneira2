/**
 * Razorpay client + HMAC verification.
 * Spec: docs/superpowers/specs/2026-05-15-aneira-backend-design.md §6
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import Razorpay from 'razorpay';
import { AppError } from './errors';

let _client: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (_client) return _client;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new AppError('INTERNAL', 'Razorpay credentials are not configured.');
  }
  _client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return _client;
}

export interface CreateOrderArgs {
  /** integer paise */
  amount: number;
  currency?: string;
  /** receipt should be your internal orderNumber */
  receipt: string;
  notes?: Record<string, string>;
}

export interface CreatedOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export async function createRazorpayOrder(args: CreateOrderArgs): Promise<CreatedOrder> {
  if (!Number.isInteger(args.amount) || args.amount < 100) {
    throw new AppError('BAD_INPUT', 'Order amount must be at least ₹1.00.');
  }
  const rzp = getRazorpayClient();
  const order = await rzp.orders.create({
    amount: args.amount,
    currency: args.currency ?? 'INR',
    receipt: args.receipt,
    notes: args.notes,
  });
  return {
    id: order.id,
    amount: Number(order.amount),
    currency: order.currency,
    receipt: order.receipt ?? args.receipt,
    status: order.status,
    created_at: order.created_at,
  };
}

/**
 * Verify the payment callback signature.
 * Razorpay docs: HMAC-SHA256( "<order_id>|<payment_id>", key_secret ) === razorpay_signature
 */
export function verifyPaymentSignature(args: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret?: string;
}): boolean {
  const secret = args.secret ?? process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new AppError('INTERNAL', 'Razorpay secret not configured.');
  if (!args.orderId || !args.paymentId || !args.signature) return false;

  const expected = createHmac('sha256', secret)
    .update(`${args.orderId}|${args.paymentId}`)
    .digest('hex');

  return safeEqualHex(expected, args.signature);
}

/**
 * Verify the webhook signature.
 * Razorpay docs: HMAC-SHA256(raw_body, webhook_secret) === X-Razorpay-Signature header
 */
export function verifyWebhookSignature(args: {
  rawBody: string;
  signature: string;
  secret?: string;
}): boolean {
  const secret = args.secret ?? process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new AppError('INTERNAL', 'Razorpay webhook secret not configured.');
  if (!args.rawBody || !args.signature) return false;

  const expected = createHmac('sha256', secret).update(args.rawBody).digest('hex');
  return safeEqualHex(expected, args.signature);
}

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}
