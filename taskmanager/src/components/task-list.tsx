"use client"

import { useEffect, useMemo, useState } from "react"
import { ListChecks } from "lucide-react"
import { TaskCard } from "@/components/task-card"
import { NewTaskDialog } from "@/components/new-task-dialog"
import { FormMessage } from "@/components/form-message"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { TaskWithRelations, UserSummary } from "@/lib/types"

type Filter = "all" | "open" | "done"

type Props = {
  initialTasks: TaskWithRelations[]
  users: UserSummary[]
  currentUserId: string
}

export function TaskList({ initialTasks, users, currentUserId }: Props) {
  const [tasks, setTasks] = useState<TaskWithRelations[]>(initialTasks)
  const [filter, setFilter] = useState<Filter>("all")
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  async function refresh() {
    setRefreshing(true)
    setError(null)
    try {
      const res = await fetch("/api/tasks")
      if (!res.ok) {
        setError("Failed to refresh tasks")
        return
      }
      setTasks((await res.json()) as TaskWithRelations[])
    } catch {
      setError("Network error")
    } finally {
      setRefreshing(false)
    }
  }

  function handleCreated(task: TaskWithRelations) {
    setTasks((prev) => [task, ...prev])
  }

  function handleChange(task: TaskWithRelations) {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)))
  }

  function handleDelete(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }

  const visible = useMemo(() => {
    if (filter === "open") return tasks.filter((t) => !t.completed)
    if (filter === "done") return tasks.filter((t) => t.completed)
    return tasks
  }, [tasks, filter])

  const counts = useMemo(
    () => ({
      all: tasks.length,
      open: tasks.filter((t) => !t.completed).length,
      done: tasks.filter((t) => t.completed).length,
    }),
    [tasks],
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Coordinate work across onshore and offshore developers.
          </p>
        </div>
        <NewTaskDialog
          users={users}
          currentUserId={currentUserId}
          onCreated={handleCreated}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "open", "done"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className={cn(
              filter === f && "bg-orange-500 text-white hover:bg-orange-600",
            )}
          >
            {f[0].toUpperCase() + f.slice(1)}
            <span className="ml-1.5 text-xs opacity-75">{counts[f]}</span>
          </Button>
        ))}
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error && <FormMessage type="error" message={error} />}

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/30 py-16 text-center">
          <ListChecks className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {filter === "all"
              ? "No tasks yet. Create one to get started."
              : `No ${filter} tasks.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {visible.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              currentUserId={currentUserId}
              onChange={handleChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
