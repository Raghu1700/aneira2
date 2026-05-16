'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth-guards';
import { withErrors, AppError, type ActionResult } from '@/lib/errors';
import { addressIdSchema, addressSchema, updateAddressSchema } from '@/lib/validators/address';

export async function listAddresses(): Promise<
  ActionResult<
    Array<{
      id: string;
      fullName: string;
      phone: string;
      line1: string;
      line2: string | null;
      city: string;
      state: string;
      pincode: string;
      country: string;
      isDefault: boolean;
    }>
  >
> {
  return withErrors(async () => {
    const user = await requireUser();
    const rows = await db.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    });
    return rows.map((r) => ({
      id: r.id,
      fullName: r.fullName,
      phone: r.phone,
      line1: r.line1,
      line2: r.line2 ?? null,
      city: r.city,
      state: r.state,
      pincode: r.pincode,
      country: r.country,
      isDefault: r.isDefault,
    }));
  });
}

export async function addAddress(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withErrors(async () => {
    const parsed = addressSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT', 'Address invalid.');
    const user = await requireUser();

    const created = await db.$transaction(async (tx) => {
      if (parsed.data.isDefault) {
        await tx.address.updateMany({
          where: { userId: user.id },
          data: { isDefault: false },
        });
      }
      const c = await tx.address.create({
        data: {
          userId: user.id,
          fullName: parsed.data.fullName,
          phone: parsed.data.phone,
          line1: parsed.data.line1,
          line2: parsed.data.line2 || null,
          city: parsed.data.city,
          state: parsed.data.state,
          pincode: parsed.data.pincode,
          country: parsed.data.country,
          isDefault: parsed.data.isDefault,
        },
      });
      // First address auto-default
      const total = await tx.address.count({ where: { userId: user.id } });
      if (total === 1 && !c.isDefault) {
        await tx.address.update({ where: { id: c.id }, data: { isDefault: true } });
      }
      return c;
    });
    revalidatePath('/account/addresses');
    return { id: created.id };
  });
}

export async function updateAddress(input: unknown): Promise<ActionResult<{ ok: true }>> {
  return withErrors(async () => {
    const parsed = updateAddressSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT');
    const user = await requireUser();

    const existing = await db.address.findUnique({ where: { id: parsed.data.id } });
    if (!existing || existing.userId !== user.id) throw new AppError('NOT_FOUND');

    await db.$transaction(async (tx) => {
      if (parsed.data.isDefault === true) {
        await tx.address.updateMany({
          where: { userId: user.id, NOT: { id: parsed.data.id } },
          data: { isDefault: false },
        });
      }
      const { id, ...rest } = parsed.data;
      await tx.address.update({
        where: { id },
        data: rest,
      });
    });
    revalidatePath('/account/addresses');
    return { ok: true } as const;
  });
}

export async function deleteAddress(input: unknown): Promise<ActionResult<{ ok: true }>> {
  return withErrors(async () => {
    const parsed = addressIdSchema.safeParse(input);
    if (!parsed.success) throw new AppError('BAD_INPUT');
    const user = await requireUser();
    const existing = await db.address.findUnique({ where: { id: parsed.data.id } });
    if (!existing || existing.userId !== user.id) throw new AppError('NOT_FOUND');
    await db.address.delete({ where: { id: existing.id } });

    // If we deleted the default, promote next
    if (existing.isDefault) {
      const next = await db.address.findFirst({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
      });
      if (next) {
        await db.address.update({ where: { id: next.id }, data: { isDefault: true } });
      }
    }

    revalidatePath('/account/addresses');
    return { ok: true } as const;
  });
}
