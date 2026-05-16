/**
 * Auth.js v5 (NextAuth) configuration.
 *
 * Two credentials providers:
 *   - "customer-otp" — sign in by verifying a previously-issued OTP from lib/otp.
 *   - "admin"        — sign in by bcrypt-verifying admin password against User.passwordHash.
 *
 * Session strategy is JWT (Auth.js v5 default when using credentials providers).
 * Roles are propagated via callbacks. Database adapter still used to persist users.
 */

import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { adminCredentialsSchema, verifyOtpSchema } from './validators/auth';
import { verifyOtp } from './otp';

declare module 'next-auth' {
  interface User {
    role?: 'CUSTOMER' | 'ADMIN';
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: 'CUSTOMER' | 'ADMIN';
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'CUSTOMER' | 'ADMIN';
    userId?: string;
  }
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: '/auth/login',
    verifyRequest: '/auth/verify',
    error: '/auth/login',
  },
  trustHost: true,
  providers: [
    Credentials({
      id: 'customer-otp',
      name: 'Email code',
      credentials: {
        email: { label: 'Email', type: 'email' },
        code: { label: 'Code', type: 'text' },
      },
      async authorize(raw) {
        const parsed = verifyOtpSchema.safeParse(raw);
        if (!parsed.success) return null;
        const result = await verifyOtp(parsed.data.email, parsed.data.code);
        if (!result.ok) return null;
        const user = await db.user.upsert({
          where: { email: parsed.data.email },
          update: { emailVerified: new Date(), lastLoginAt: new Date() },
          create: {
            email: parsed.data.email,
            emailVerified: new Date(),
            lastLoginAt: new Date(),
            role: 'CUSTOMER',
          },
        });
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          role: user.role,
        };
      },
    }),
    Credentials({
      id: 'admin',
      name: 'Admin',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(raw) {
        const parsed = adminCredentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const user = await db.user.findUnique({ where: { email: parsed.data.email } });
        if (!user || user.role !== 'ADMIN' || !user.passwordHash) return null;
        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id ?? token.userId;
        token.role = user.role ?? 'CUSTOMER';
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.userId as string) ?? session.user.id;
        session.user.role = (token.role as 'CUSTOMER' | 'ADMIN') ?? 'CUSTOMER';
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // open-redirect prevention
      try {
        const target = new URL(url, baseUrl);
        if (target.origin === baseUrl) return target.toString();
      } catch {
        // fallthrough
      }
      return baseUrl;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
