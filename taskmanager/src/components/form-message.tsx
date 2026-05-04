"use client"

import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

type FormMessageProps = {
  type: "error" | "success"
  message: string
  compact?: boolean
  className?: string
}

export function FormMessage({
  type,
  message,
  compact = false,
  className,
}: FormMessageProps) {
  const Icon = type === "error" ? AlertCircle : CheckCircle2
  return (
    <Alert
      variant={type === "error" ? "destructive" : "default"}
      className={cn(
        "border-l-4",
        "animate-in fade-in slide-in-from-top-1 duration-300",
        type === "error"
          ? "border-l-red-500 bg-red-50"
          : "border-l-orange-500 bg-orange-50 text-orange-800",
        compact && "px-2.5 py-1.5 text-xs gap-x-1.5 *:[svg:not([class*='size-'])]:size-3.5",
        className,
      )}
    >
      <Icon />
      <AlertDescription
        className={cn(
          compact && "text-xs",
          type === "success" ? "text-orange-700" : undefined,
        )}
      >
        {message}
      </AlertDescription>
    </Alert>
  )
}
