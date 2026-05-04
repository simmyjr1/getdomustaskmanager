import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/session';

const VALID_TZ_RE = /^[A-Za-z_]+\/[A-Za-z_+\-0-9/]+$|^UTC$/;

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, timeZone: true },
  });

  if (!user) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(user, { status: 200 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return Response.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { timeZone, name } = body as { timeZone?: unknown; name?: unknown };

  const data: { timeZone?: string; name?: string | null } = {};

  if (timeZone !== undefined) {
    if (typeof timeZone !== 'string' || !VALID_TZ_RE.test(timeZone)) {
      return Response.json({ error: 'Invalid timeZone' }, { status: 400 });
    }
    try {
      new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
    } catch {
      return Response.json({ error: 'Unknown timeZone' }, { status: 400 });
    }
    data.timeZone = timeZone;
  }

  if (name !== undefined) {
    if (name !== null && typeof name !== 'string') {
      return Response.json({ error: 'Invalid name' }, { status: 400 });
    }
    data.name =
      typeof name === 'string' && name.trim().length > 0 ? name.trim() : null;
  }

  const user = await prisma.user.update({
    where: { id: session.userId },
    data,
    select: { id: true, email: true, name: true, timeZone: true },
  });

  return Response.json(user, { status: 200 });
}
