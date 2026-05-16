/**
 * Edge middleware.
 *
 * Responsibilities:
 *   1. Admin route protection — sessions checked, non-admin gets 404.
 *   2. Account route protection — redirects to login.
 *
 * Note: Auth.js v5 JWT strategy is used so the middleware can read the session
 * cookie without database access at the edge.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const ADMIN_PREFIX = '/admin';
const ADMIN_LOGIN = '/admin/auth/login';
const ACCOUNT_PREFIX = '/account';
const ACCOUNT_LOGIN = '/auth/login';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // skip auth API and static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') // files
  ) {
    return NextResponse.next();
  }

  const isAdminRoute = pathname.startsWith(ADMIN_PREFIX) && pathname !== ADMIN_LOGIN;
  const isAccountRoute = pathname.startsWith(ACCOUNT_PREFIX);

  if (!isAdminRoute && !isAccountRoute) return NextResponse.next();

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  if (isAdminRoute) {
    if (!token || token.role !== 'ADMIN') {
      // 404 — never hint that admin exists
      return NextResponse.rewrite(new URL('/404', req.url));
    }
    return NextResponse.next();
  }

  if (isAccountRoute) {
    if (!token) {
      const url = new URL(ACCOUNT_LOGIN, req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
