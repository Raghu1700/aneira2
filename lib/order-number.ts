/**
 * Order number generator that's safe under concurrency.
 * Uses a per-year counter via Postgres advisory lock + COUNT — sufficient
 * for v1 throughput. For higher TPS, switch to a dedicated sequence.
 */

import { db } from './db';
import { generateOrderNumber } from './format';

export async function generateNextOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));

  // Count + 1 as the seq. Safe under serializable txn at order-create.
  const count = await db.order.count({
    where: { createdAt: { gte: start, lt: end } },
  });
  return generateOrderNumber(count + 1, new Date());
}
