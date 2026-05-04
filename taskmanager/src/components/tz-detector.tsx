"use client"

import { useEffect } from "react"

type Props = {
  currentTimeZone: string
}

export function TZDetector({ currentTimeZone }: Props) {
  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (!detected || detected === currentTimeZone) return
    fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timeZone: detected }),
    }).catch(() => {})
  }, [currentTimeZone])

  return null
}
