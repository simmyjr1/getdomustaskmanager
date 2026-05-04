"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type Props = {
  timeZone: string
  className?: string
  showTimeZone?: boolean
}

function format(timeZone: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date())
  } catch {
    return "--:--"
  }
}

function shortTz(timeZone: string) {
  const last = timeZone.split("/").pop() ?? timeZone
  return last.replace(/_/g, " ")
}

export function LocalTime({ timeZone, className, showTimeZone = true }: Props) {
  const [value, setValue] = useState(() => format(timeZone))

  useEffect(() => {
    setValue(format(timeZone))
    const tick = setInterval(() => setValue(format(timeZone)), 30_000)
    return () => clearInterval(tick)
  }, [timeZone])

  return (
    <span className={cn("inline-flex items-baseline gap-1 tabular-nums", className)}>
      <span className="font-medium">{value}</span>
      {showTimeZone && (
        <span className="text-xs text-muted-foreground">{shortTz(timeZone)}</span>
      )}
    </span>
  )
}
