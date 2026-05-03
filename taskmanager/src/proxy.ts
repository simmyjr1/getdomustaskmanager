import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const ALG = 'HS256';

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
  const ok = await hasValidAccessToken(request);
  if (!ok) {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
