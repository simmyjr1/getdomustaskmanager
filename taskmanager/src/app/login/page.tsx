"use client"

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <img
            src="/Screenshot_2026-05-02_at_23.08.21-removebg-preview.png"
            alt="Get Domus logo"
            className="h-20 w-20 object-contain"
          />
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
