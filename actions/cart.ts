'use server';

import { revalidatePath } from 'next/cache';
import { Decimal } from 'decimal.js';
import { db } from '@/lib/db';
import { getOrCreateCartToken, readCartToken, clearCartToken } from '@/lib/cart-token';
import { withErrors, AppError, type ActionResult } from '@/lib/errors';
import { addToCartSchema, removeCartLineSchema, updateCartLineSchema } from '@/lib/validators/cart';
import { getSessionUser } from '@/lib/auth-guards';

async function loadOrCreateCart(userId: string | null) {
  const token = await getOrCreateCartToken();
  let cart = await db.cart.findUnique({ where: { token } });
  if (!cart) {
    cart = await db.cart.create({ data: { token, userId } });
  } else if (userId && !cart.userId) {
    cart = await db.cart.update({ where: { id: cart.id }, data: { userId } });
  }
  return cart;
}

export async function addToCart(
  input: unknown,
): Promise<ActionResult<{ cartId: string; lineId: string }>> {
  return withErrors(async () => {
    const parsed = addToCartSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT', 'Invalid product.', flatten(parsed.error));

    const user = await getSessionUser();
    const cart = await loadOrCreateCart(user?.id ?? null);

    const product = await db.product.findUnique({
      where: { id: parsed.data.productId },
      include: { variants: true },
    });
    if (!product || !product.isPublished) throw new AppError('NOT_FOUND', 'Product not found.');

    let priceSnapshot: Decimal = new Decimal(product.basePrice as unknown as string);
    let inventory = product.inventory;
    let variantId: string | null = parsed.data.variantId ?? null;

    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant || !variant.isAvailable) throw new AppError('NOT_FOUND', 'Variant unavailable.');
      if (variant.priceOverride) {
        priceSnapshot = new Decimal(variant.priceOverride as unknown as string);
      }
      inventory = variant.inventory;
    }

    if (inventory < parsed.data.quantity) {
      throw new AppError('OUT_OF_STOCK', 'Not enough stock available.');
    }

    const existing = await db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id,
        variantId: variantId ?? null,
      },
    });

    const desiredQty = (existing?.quantity ?? 0) + parsed.data.quantity;
    if (desiredQty > inventory) {
      throw new AppError('OUT_OF_STOCK', 'Not enough stock for that quantity.');
    }

    const line = existing
      ? await db.cartItem.update({
          where: { id: existing.id },
          data: { quantity: desiredQty, priceSnapshot },
        })
      : await db.cartItem.create({
          data: {
            cartId: cart.id,
            productId: product.id,
            variantId,
            quantity: parsed.data.quantity,
            priceSnapshot,
          },
        });

    revalidatePath('/cart');
    return { cartId: cart.id, lineId: line.id };
  });
}

export async function updateCartLine(input: unknown): Promise<ActionResult<{ removed: boolean }>> {
  return withErrors(async () => {
    const parsed = updateCartLineSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT');

    const token = await readCartToken();
    if (!token) throw new AppError('NOT_FOUND', 'Cart not found.');

    const line = await db.cartItem.findUnique({
      where: { id: parsed.data.lineId },
      include: { cart: true, product: { include: { variants: true } } },
    });
    if (!line || line.cart.token !== token) throw new AppError('NOT_FOUND', 'Line not found.');

    if (parsed.data.quantity === 0) {
      await db.cartItem.delete({ where: { id: line.id } });
      revalidatePath('/cart');
      return { removed: true };
    }

    const inventory = line.variantId
      ? (line.product.variants.find((v) => v.id === line.variantId)?.inventory ?? 0)
      : line.product.inventory;
    if (parsed.data.quantity > inventory)
      throw new AppError('OUT_OF_STOCK', 'Quantity exceeds stock.');

    await db.cartItem.update({
      where: { id: line.id },
      data: { quantity: parsed.data.quantity },
    });
    revalidatePath('/cart');
    return { removed: false };
  });
}

export async function removeCartLine(input: unknown): Promise<ActionResult<{ ok: true }>> {
  return withErrors(async () => {
    const parsed = removeCartLineSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT');

    const token = await readCartToken();
    if (!token) throw new AppError('NOT_FOUND');

    const line = await db.cartItem.findUnique({
      where: { id: parsed.data.lineId },
      include: { cart: true },
    });
    if (!line || line.cart.token !== token) throw new AppError('NOT_FOUND');

    await db.cartItem.delete({ where: { id: line.id } });
    revalidatePath('/cart');
    return { ok: true } as const;
  });
}

export async function clearCart(): Promise<ActionResult<{ ok: true }>> {
  return withErrors(async () => {
    const token = await readCartToken();
    if (!token) return { ok: true } as const;
    const cart = await db.cart.findUnique({ where: { token } });
    if (!cart) return { ok: true } as const;
    await db.cartItem.deleteMany({ where: { cartId: cart.id } });
    revalidatePath('/cart');
    return { ok: true } as const;
  });
}

export async function getCart(): Promise<
  ActionResult<{
    id: string;
    items: Array<{
      id: string;
      productId: string;
      variantId: string | null;
      title: string;
      handle: string;
      imageUrl: string | null;
      price: string;
      quantity: number;
      lineTotal: string;
      inventory: number;
    }>;
    subtotal: string;
    count: number;
  }>
> {
  return withErrors(async () => {
    const token = await readCartToken();
    if (!token) {
      return { id: '', items: [], subtotal: '0', count: 0 };
    }
    const cart = await db.cart.findUnique({
      where: { token },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
          include: {
            product: {
              include: { images: { orderBy: { order: 'asc' }, take: 1 } },
            },
            variant: true,
          },
        },
      },
    });
    if (!cart) return { id: '', items: [], subtotal: '0', count: 0 };

    let subtotal = new Decimal(0);
    let count = 0;
    const items = cart.items.map((line) => {
      const price = new Decimal(line.priceSnapshot as unknown as string);
      const lineTotal = price.mul(line.quantity);
      subtotal = subtotal.add(lineTotal);
      count += line.quantity;
      const inventory = line.variant?.inventory ?? line.product.inventory;
      return {
        id: line.id,
        productId: line.productId,
        variantId: line.variantId ?? null,
        title: line.product.title,
        handle: line.product.handle,
        imageUrl: line.product.images[0]?.url ?? null,
        price: price.toFixed(2),
        quantity: line.quantity,
        lineTotal: lineTotal.toFixed(2),
        inventory,
      };
    });

    return { id: cart.id, items, subtotal: subtotal.toFixed(2), count };
  });
}

/**
 * Merge guest cart into the user's cart on login.
 * Called from login completion flow.
 */
export async function mergeCartIntoUser(): Promise<ActionResult<{ merged: number }>> {
  return withErrors(async () => {
    const user = await getSessionUser();
    if (!user) throw new AppError('UNAUTHORIZED');
    const token = await readCartToken();
    if (!token) return { merged: 0 };

    const guest = await db.cart.findUnique({ where: { token }, include: { items: true } });
    if (!guest || guest.items.length === 0) return { merged: 0 };

    const userCart = await db.cart.findFirst({ where: { userId: user.id } });

    if (!userCart) {
      await db.cart.update({ where: { id: guest.id }, data: { userId: user.id } });
      return { merged: guest.items.length };
    }

    // Merge items
    let merged = 0;
    for (const line of guest.items) {
      const existing = await db.cartItem.findFirst({
        where: {
          cartId: userCart.id,
          productId: line.productId,
          variantId: line.variantId,
        },
      });
      if (existing) {
        await db.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + line.quantity },
        });
      } else {
        await db.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: line.productId,
            variantId: line.variantId,
            quantity: line.quantity,
            priceSnapshot: line.priceSnapshot,
          },
        });
      }
      merged++;
    }
    await db.cart.delete({ where: { id: guest.id } });
    await clearCartToken();
    return { merged };
  });
}

function flatten(error: import('zod').ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
