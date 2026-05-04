import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/session';

type Ctx = { params: Promise<{ id: string }> };

async function getAccessibleTask(taskId: string, userId: string) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      OR: [
        { createdById: userId },
        { assignees: { some: { id: userId } } },
      ],
    },
  });
}

export async function GET(_request: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const task = await prisma.task.findFirst({
    where: {
      id,
      OR: [
        { createdById: session.userId },
        { assignees: { some: { id: session.userId } } },
      ],
    },
    include: {
      assignees: {
        select: { id: true, email: true, name: true, timeZone: true },
      },
      createdBy: { select: { id: true, email: true, name: true } },
    },
  });

  if (!task) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(task, { status: 200 });
}

export async function PATCH(request: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const existing = await getAccessibleTask(id, session.userId);
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (typeof body !== 'object' || body === null) {
    return Response.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { title, description, completed, assigneeIds, dueDate } = body as {
    title?: unknown;
    description?: unknown;
    completed?: unknown;
    assigneeIds?: unknown;
    dueDate?: unknown;
  };

  const data: {
    title?: string;
    description?: string | null;
    completed?: boolean;
    dueDate?: Date | null;
  } = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return Response.json({ error: 'Title cannot be empty' }, { status: 400 });
    }
    if (title.length > 200) {
      return Response.json({ error: 'Title is too long' }, { status: 400 });
    }
    data.title = title.trim();
  }

  if (description !== undefined) {
    if (description !== null && typeof description !== 'string') {
      return Response.json({ error: 'Invalid description' }, { status: 400 });
    }
    data.description =
      typeof description === 'string' && description.trim().length > 0
        ? description.trim()
        : null;
  }

  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return Response.json({ error: 'Invalid completed' }, { status: 400 });
    }
    data.completed = completed;
  }

  if (dueDate !== undefined) {
    if (dueDate === null || dueDate === '') {
      data.dueDate = null;
    } else if (typeof dueDate === 'string') {
      const d = new Date(dueDate);
      if (Number.isNaN(d.getTime())) {
        return Response.json({ error: 'Invalid dueDate' }, { status: 400 });
      }
      data.dueDate = d;
    } else {
      return Response.json({ error: 'Invalid dueDate' }, { status: 400 });
    }
  }

  let assigneesUpdate;
  if (assigneeIds !== undefined) {
    if (
      !Array.isArray(assigneeIds) ||
      !assigneeIds.every((id) => typeof id === 'string')
    ) {
      return Response.json(
        { error: 'assigneeIds must be an array of strings' },
        { status: 400 },
      );
    }
    assigneesUpdate = {
      set: (assigneeIds as string[]).map((aid) => ({ id: aid })),
    };
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...data,
      ...(assigneesUpdate ? { assignees: assigneesUpdate } : {}),
    },
    include: {
      assignees: {
        select: { id: true, email: true, name: true, timeZone: true },
      },
      createdBy: { select: { id: true, email: true, name: true } },
    },
  });

  return Response.json(task, { status: 200 });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.task.findFirst({
    where: { id, createdById: session.userId },
  });
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 });

  await prisma.task.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
