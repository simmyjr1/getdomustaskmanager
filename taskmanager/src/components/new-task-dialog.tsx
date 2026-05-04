"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { FormMessage } from "@/components/form-message"
import { LocalTime } from "@/components/local-time"
import type { TaskWithRelations, UserSummary } from "@/lib/types"

type Props = {
  users: UserSummary[]
  currentUserId: string
  onCreated: (task: TaskWithRelations) => void
}

export function NewTaskDialog({ users, currentUserId, onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [assigneeIds, setAssigneeIds] = useState<string[]>([currentUserId])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function reset() {
    setTitle("")
    setDescription("")
    setDueDate("")
    setAssigneeIds([currentUserId])
    setError(null)
    setLoading(false)
  }

  function toggleAssignee(id: string) {
    setAssigneeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (title.trim().length === 0) {
      setError("Title is required")
      return
    }
    if (assigneeIds.length === 0) {
      setError("Pick at least one assignee")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          assigneeIds,
          dueDate: dueDate || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? "Failed to create task")
        return
      }
      const task = (await res.json()) as TaskWithRelations
      onCreated(task)
      setOpen(false)
      reset()
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-orange-500 text-white hover:bg-orange-600">
          <Plus className="size-4" />
          New task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a task</DialogTitle>
          <DialogDescription>
            Assign one or more developers. Their local time is shown so you can
            avoid out-of-hours work.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            {error && <FormMessage type="error" message={error} />}

            <Field>
              <FieldLabel htmlFor="task-title">Title</FieldLabel>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ship the login redesign"
                required
                maxLength={200}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="task-description">Description</FieldLabel>
              <Textarea
                id="task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional context, links, acceptance criteria..."
                rows={4}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="task-due-date">Due date</FieldLabel>
              <Input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <FieldDescription>Optional.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel>Assignees</FieldLabel>
              <FieldDescription>
                Pick everyone who needs to work on this. Local time shows
                whether they&apos;re inside working hours.
              </FieldDescription>
              <div className="mt-2 max-h-56 overflow-y-auto rounded-md border">
                {users.map((u) => {
                  const checked = assigneeIds.includes(u.id)
                  return (
                    <label
                      key={u.id}
                      htmlFor={`assignee-${u.id}`}
                      className="flex cursor-pointer items-center gap-3 border-b px-3 py-2 last:border-b-0 hover:bg-muted/50"
                    >
                      <Checkbox
                        id={`assignee-${u.id}`}
                        checked={checked}
                        onCheckedChange={() => toggleAssignee(u.id)}
                      />
                      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {u.name ?? u.email}
                            {u.id === currentUserId && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                (you)
                              </span>
                            )}
                          </div>
                          {u.name && (
                            <div className="truncate text-xs text-muted-foreground">
                              {u.email}
                            </div>
                          )}
                        </div>
                        <LocalTime timeZone={u.timeZone} className="text-xs" />
                      </div>
                    </label>
                  )
                })}
              </div>
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              {loading ? "Creating..." : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
