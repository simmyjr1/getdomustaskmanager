import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const ALG = 'HS256';

const AUTH_PAGES = new Set([
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
]);

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is not set');
  return new TextEncoder().encode(secret);
}

async function hasValidAccessToken(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret(), { algorithms: [ALG] });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = await hasValidAccessToken(request);

  if (pathname.startsWith('/dashboard')) {
    if (!authed) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  if (AUTH_PAGES.has(pathname) && authed) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ],
};
