import { redirect } from "next/navigation"
import { TaskList } from "@/components/task-list"
import { auth } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import type { TaskWithRelations, UserSummary } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function TasksPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const [users, rawTasks] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, email: true, name: true, timeZone: true },
      orderBy: [{ name: "asc" }, { email: "asc" }],
    }),
    prisma.task.findMany({
      where: {
        OR: [
          { createdById: session.userId },
          { assignees: { some: { id: session.userId } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        assignees: {
          select: { id: true, email: true, name: true, timeZone: true },
        },
        createdBy: { select: { id: true, email: true, name: true } },
      },
    }),
  ])

  const tasks: TaskWithRelations[] = rawTasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    completed: t.completed,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    createdById: t.createdById,
    createdBy: t.createdBy,
    assignees: t.assignees,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }))

  const userList: UserSummary[] = users

  return (
    <TaskList
      initialTasks={tasks}
      users={userList}
      currentUserId={session.userId}
    />
  )
}
