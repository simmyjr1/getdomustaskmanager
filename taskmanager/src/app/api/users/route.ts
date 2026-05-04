import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/session';

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, timeZone: true },
    orderBy: [{ name: 'asc' }, { email: 'asc' }],
  });

  return Response.json(users, { status: 200 });
}
