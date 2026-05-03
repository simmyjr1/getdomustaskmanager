import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/passwords';
import { signAccessToken, generateRefreshToken } from '@/lib/auth/token';
import { setAuthCookies, REFRESH_TOKEN_TTL_MS } from '@/lib/auth/cookies';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const { email, password, name } = body as {
    email?: unknown;
    password?: unknown;
    name?: unknown;
  };

  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return Response.json({ error: 'Invalid email' }, { status: 400 });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return Response.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 },
    );
  }
  if (name !== undefined && typeof name !== 'string') {
    return Response.json({ error: 'Invalid name' }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return Response.json({ error: 'Email already in use' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: typeof name === 'string' ? name : null,
      },
      select: { id: true, email: true, name: true },
    });
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      return Response.json({ error: 'Email already in use' }, { status: 409 });
    }
    throw err;
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

  return Response.json(user, { status: 201 });
}
