"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LocalTime } from "@/components/local-time"
import { cn } from "@/lib/utils"
import type { UserSummary } from "@/lib/types"

type Props = {
  users: UserSummary[]
  currentUserId: string
}

function initials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

function isInWorkingHours(timeZone: string): boolean {
  try {
    const hour = Number(
      new Intl.DateTimeFormat("en-GB", {
        timeZone,
        hour: "2-digit",
        hour12: false,
      }).format(new Date()),
    )
    return hour >= 9 && hour < 18
  } catch {
    return false
  }
}

export function TeamList({ users, currentUserId }: Props) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => {
      return (
        u.email.toLowerCase().includes(q) ||
        (u.name?.toLowerCase().includes(q) ?? false) ||
        u.timeZone.toLowerCase().includes(q)
      )
    })
  }, [users, query])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Team</h1>
        <p className="text-sm text-muted-foreground">
          See where everyone is right now. Green dot means inside 09:00–18:00
          local time.
        </p>
      </div>

      <Input
        type="search"
        placeholder="Search by name, email, or timezone..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/30 py-12 text-center text-sm text-muted-foreground">
          No people match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u) => {
            const inHours = isInWorkingHours(u.timeZone)
            const isMe = u.id === currentUserId
            return (
              <Card key={u.id}>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-medium text-white">
                    {initials(u.name, u.email)}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {u.name ?? u.email}
                      </span>
                      {isMe && (
                        <span className="text-xs text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </div>
                    {u.name && (
                      <span className="truncate text-xs text-muted-foreground">
                        {u.email}
                      </span>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          inHours ? "bg-emerald-500" : "bg-zinc-300",
                        )}
                        aria-hidden
                      />
                      <LocalTime timeZone={u.timeZone} className="text-xs" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
