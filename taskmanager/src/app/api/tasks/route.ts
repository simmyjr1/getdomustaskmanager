import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/session';

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { createdById: session.userId },
        { assignees: { some: { id: session.userId } } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      assignees: {
        select: { id: true, email: true, name: true, timeZone: true },
      },
      createdBy: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  return Response.json(tasks, { status: 200 });
}

export async function POST(request: Request) {
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

  const { title, description, assigneeIds, dueDate } = body as {
    title?: unknown;
    description?: unknown;
    assigneeIds?: unknown;
    dueDate?: unknown;
  };

  if (typeof title !== 'string' || title.trim().length === 0) {
    return Response.json({ error: 'Title is required' }, { status: 400 });
  }
  if (title.length > 200) {
    return Response.json({ error: 'Title is too long' }, { status: 400 });
  }
  if (description !== undefined && typeof description !== 'string') {
    return Response.json({ error: 'Invalid description' }, { status: 400 });
  }
  if (
    !Array.isArray(assigneeIds) ||
    !assigneeIds.every((id) => typeof id === 'string')
  ) {
    return Response.json({ error: 'assigneeIds must be an array of strings' }, { status: 400 });
  }
  if (dueDate !== undefined && dueDate !== null && typeof dueDate !== 'string') {
    return Response.json({ error: 'Invalid dueDate' }, { status: 400 });
  }

  const dueDateValue =
    typeof dueDate === 'string' && dueDate.length > 0 ? new Date(dueDate) : null;
  if (dueDateValue && Number.isNaN(dueDateValue.getTime())) {
    return Response.json({ error: 'Invalid dueDate' }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      description:
        typeof description === 'string' && description.trim().length > 0
          ? description.trim()
          : null,
      dueDate: dueDateValue,
      createdById: session.userId,
      assignees: {
        connect: (assigneeIds as string[]).map((id) => ({ id })),
      },
    },
    include: {
      assignees: {
        select: { id: true, email: true, name: true, timeZone: true },
      },
      createdBy: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  return Response.json(task, { status: 201 });
}
