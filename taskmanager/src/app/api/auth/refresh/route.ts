import { prisma } from '@/lib/prisma';
import { signAccessToken, generateRefreshToken } from '@/lib/auth/token';
import {
  setAuthCookies,
  readRefreshCookie,
  clearAuthCookies,
  REFRESH_TOKEN_TTL_MS,
} from '@/lib/auth/cookies';

export async function POST() {
  const presented = await readRefreshCookie();
  if (!presented) {
    return Response.json({ error: 'No refresh token' }, { status: 401 });
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: presented },
  });

  if (!stored) {
    await clearAuthCookies();
    return Response.json({ error: 'Invalid refresh token' }, { status: 401 });
  }

  if (stored.revokedAt !== null) {
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await clearAuthCookies();
    return Response.json({ error: 'Refresh token reuse detected' }, { status: 401 });
  }

  if (stored.expiresAt.getTime() < Date.now()) {
    await clearAuthCookies();
    return Response.json({ error: 'Refresh token expired' }, { status: 401 });
  }

  const newRefreshToken = generateRefreshToken();
  const newAccessToken = await signAccessToken(stored.userId);

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { token: presented },
      data: { revokedAt: new Date() },
    }),
    prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: stored.userId,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    }),
  ]);

  await setAuthCookies(newAccessToken, newRefreshToken);

  return Response.json({ ok: true }, { status: 200 });
}
