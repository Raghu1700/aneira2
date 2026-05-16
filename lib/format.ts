/**
 * Display formatters. Pure functions — no I/O.
 */

import { Decimal } from 'decimal.js';

/**
 * Generate sequential order number: ANE-YYYY-NNNN (4-digit zero-padded).
 * `seq` is the per-year ordinal (1-based).
 */
export function generateOrderNumber(seq: number, date: Date = new Date()): string {
  if (!Number.isInteger(seq) || seq < 1) {
    throw new Error('generateOrderNumber: seq must be positive integer');
  }
  const year = date.getFullYear();
  return `ANE-${year}-${String(seq).padStart(4, '0')}`;
}

/** Indian-style currency: ₹1,23,456.00 */
export function formatINR(amount: Decimal | string | number): string {
  const value = amount instanceof Decimal ? amount : new Decimal(amount);
  const n = value.toFixed(2);
  const [intPart, decPart] = n.split('.');
  // Indian grouping: last 3 digits, then groups of 2
  const sign = intPart!.startsWith('-') ? '-' : '';
  const digits = intPart!.replace('-', '');
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3);
  const grouped =
    rest.length > 0
      ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}`
      : last3;
  return `${sign}₹${grouped}.${decPart}`;
}

export function formatDateLong(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateShort(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Slugify for product/collection handles. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
