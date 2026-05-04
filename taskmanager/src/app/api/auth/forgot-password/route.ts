import { prisma } from '@/lib/prisma';
import { generateRefreshToken } from '@/lib/auth/token';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESET_TOKEN_TTL_MS = 1000 * 60 * 30;

const GENERIC_OK = {
  message: 'If an account exists for that email, a reset link has been sent.',
};

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

  const { email } = body as { email?: unknown };

  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return Response.json(GENERIC_OK, { status: 200 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true },
  });

  if (!user) {
    return Response.json(GENERIC_OK, { status: 200 });
  }

  const token = generateRefreshToken();

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  console.log(
    `[forgot-password] Reset token for ${user.email}: ${token} (valid 30 min)`,
  );

  return Response.json(GENERIC_OK, { status: 200 });
}
