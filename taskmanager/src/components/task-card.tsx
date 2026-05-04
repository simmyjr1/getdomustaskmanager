"use client"

import { useState } from "react"
import { Trash2, Users, CalendarDays } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LocalTime } from "@/components/local-time"
import { cn } from "@/lib/utils"
import type { TaskWithRelations } from "@/lib/types"

type Props = {
  task: TaskWithRelations
  currentUserId: string
  onChange: (task: TaskWithRelations) => void
  onDelete: (taskId: string) => void
}

function formatDueDate(iso: string | null): string | null {
  if (!iso) return null
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso))
  } catch {
    return null
  }
}

export function TaskCard({ task, currentUserId, onChange, onDelete }: Props) {
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const canDelete = task.createdById === currentUserId
  const due = formatDueDate(task.dueDate)

  async function toggleCompleted(next: boolean) {
    setUpdating(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: next }),
      })
      if (!res.ok) return
      const updated = (await res.json()) as TaskWithRelations
      onChange(updated)
    } finally {
      setUpdating(false)
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this task?")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" })
      if (res.ok) onDelete(task.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className={cn(task.completed && "opacity-60")}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            disabled={updating}
            onCheckedChange={(v) => toggleCompleted(Boolean(v))}
            className="mt-1"
            aria-label="Toggle completed"
          />
          <div className="flex-1 min-w-0">
            <CardTitle
              className={cn(
                "text-base",
                task.completed && "line-through text-muted-foreground",
              )}
            >
              {task.title}
            </CardTitle>
            {task.description && (
              <CardDescription className="mt-1 whitespace-pre-wrap">
                {task.description}
              </CardDescription>
            )}
          </div>
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={deleting}
              aria-label="Delete task"
              className="text-muted-foreground hover:text-red-600"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            <span>{task.assignees.length} assignee{task.assignees.length === 1 ? "" : "s"}</span>
            {due && (
              <>
                <span aria-hidden>·</span>
                <CalendarDays className="size-3.5" />
                <span>{due}</span>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {task.assignees.map((a) => (
              <Badge
                key={a.id}
                variant="outline"
                className="flex items-center gap-2 px-2.5 py-1 font-normal"
              >
                <span className="text-sm">{a.name ?? a.email}</span>
                <span className="h-3 w-px bg-border" aria-hidden />
                <LocalTime timeZone={a.timeZone} className="text-xs" />
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
