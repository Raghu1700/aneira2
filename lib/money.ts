/**
 * Money math. Always use Decimal — never JS number.
 * Postgres stores Decimal(10,2). Razorpay needs integer paise (rupees * 100).
 */

import { Decimal } from 'decimal.js';

Decimal.set({ rounding: Decimal.ROUND_HALF_UP, precision: 20 });

export type Money = Decimal;

export const ZERO: Money = new Decimal(0);

export function toMoney(input: Decimal | string | number): Money {
  if (input instanceof Decimal) return input;
  return new Decimal(input);
}

/** Rupees → integer paise. Rounds half-up. */
export function toPaise(amount: Decimal | string | number): number {
  const n = toMoney(amount).mul(100).toNearest(1, Decimal.ROUND_HALF_UP);
  if (!n.isFinite() || n.isNegative()) {
    throw new Error('toPaise: invalid amount');
  }
  const num = n.toNumber();
  if (!Number.isSafeInteger(num)) {
    throw new Error('toPaise: result not a safe integer');
  }
  return num;
}

export function fromPaise(paise: number): Money {
  if (!Number.isInteger(paise) || paise < 0) {
    throw new Error('fromPaise: must be non-negative integer');
  }
  return new Decimal(paise).div(100);
}

export function sum(values: Array<Decimal | string | number>): Money {
  return values.reduce<Money>((acc, v) => acc.add(toMoney(v)), ZERO);
}

export interface CartLineInput {
  price: Decimal | string | number;
  quantity: number;
}

export function lineTotal(line: CartLineInput): Money {
  if (!Number.isInteger(line.quantity) || line.quantity < 1) {
    throw new Error('lineTotal: quantity must be positive integer');
  }
  return toMoney(line.price).mul(line.quantity);
}

export function subtotal(lines: CartLineInput[]): Money {
  return lines.reduce<Money>((acc, l) => acc.add(lineTotal(l)), ZERO);
}

/**
 * GST-exclusive calculation:
 * subtotal -> tax = subtotal * rate, shippingTaxable optional.
 */
export function computeGst(amount: Decimal | string | number, rate: Decimal | string | number): Money {
  return toMoney(amount).mul(toMoney(rate)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export interface ShippingConfig {
  freeShippingMin: Decimal | string | number;
  flatRate: Decimal | string | number;
}

export function computeShipping(subtotalAmt: Decimal | string | number, cfg: ShippingConfig): Money {
  const s = toMoney(subtotalAmt);
  const min = toMoney(cfg.freeShippingMin);
  if (s.gte(min)) return ZERO;
  return toMoney(cfg.flatRate);
}

export interface OrderTotals {
  subtotal: Money;
  shipping: Money;
  gstRate: Money;
  gstAmount: Money;
  total: Money;
}

export interface OrderCalculationInput {
  lines: CartLineInput[];
  gstRate: Decimal | string | number;
  shipping: ShippingConfig;
}

export function computeOrderTotals(input: OrderCalculationInput): OrderTotals {
  const sub = subtotal(input.lines).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const shipping = computeShipping(sub, input.shipping);
  const rate = toMoney(input.gstRate);
  const gst = computeGst(sub.add(shipping), rate);
  const total = sub.add(shipping).add(gst).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  return { subtotal: sub, shipping, gstRate: rate, gstAmount: gst, total };
}
