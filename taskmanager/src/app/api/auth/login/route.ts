import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/passwords';
import { signAccessToken, generateRefreshToken } from '@/lib/auth/token';
import { setAuthCookies, REFRESH_TOKEN_TTL_MS } from '@/lib/auth/cookies';

const INVALID_CREDENTIALS = { error: 'Invalid credentials' };

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

  const { email, password } = body as { email?: unknown; password?: unknown };

  if (typeof email !== 'string' || typeof password !== 'string') {
    return Response.json(INVALID_CREDENTIALS, { status: 401 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true, name: true, passwordHash: true },
  });

  if (!user) {
    return Response.json(INVALID_CREDENTIALS, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return Response.json(INVALID_CREDENTIALS, { status: 401 });
  }

  const accessToken = await signAccessToken(user.id);
  const refreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  await setAuthCookies(accessToken, refreshToken);

  return Response.json(
    { id: user.id, email: user.email, name: user.name },
    { status: 200 },
  );
}
