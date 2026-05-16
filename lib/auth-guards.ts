/**
 * Server-only session guards. Use at the top of any server action that requires
 * an authenticated user or admin.
 */

import 'server-only';
import { auth } from './auth';
import { AppError } from './errors';

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: 'CUSTOMER' | 'ADMIN';
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user?.email) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    role: (user.role as 'CUSTOMER' | 'ADMIN') ?? 'CUSTOMER',
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AppError('UNAUTHORIZED');
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AppError('UNAUTHORIZED');
  if (user.role !== 'ADMIN') throw new AppError('FORBIDDEN');
  return user;
}
