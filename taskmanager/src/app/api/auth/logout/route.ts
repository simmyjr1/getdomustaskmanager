import { prisma } from '@/lib/prisma';
import { readRefreshCookie, clearAuthCookies } from '@/lib/auth/cookies';

export async function POST() {
  const presented = await readRefreshCookie();

  if (presented) {
    await prisma.refreshToken
      .updateMany({
        where: { token: presented, revokedAt: null },
        data: { revokedAt: new Date() },
      })
      .catch(() => {});
  }

  await clearAuthCookies();

  return new Response(null, { status: 204 });
}
