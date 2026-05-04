import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/passwords';

const GENERIC_TOKEN_ERROR = { error: 'Invalid or expired reset token' };

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return Response.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { token, newPassword } = body as {
    token?: unknown;
    newPassword?: unknown;
  };

  if (typeof token !== 'string' || token.length === 0) {
    return Response.json(GENERIC_TOKEN_ERROR, { status: 400 });
  }
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return Response.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 },
    );
  }

  const stored = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (
    !stored ||
    stored.usedAt !== null ||
    stored.expiresAt.getTime() < Date.now()
  ) {
    return Response.json(GENERIC_TOKEN_ERROR, { status: 400 });
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: stored.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  return Response.json({ ok: true }, { status: 200 });
}
