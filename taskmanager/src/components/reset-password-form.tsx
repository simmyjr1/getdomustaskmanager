"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FormMessage } from "@/components/form-message"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  validatePassword,
  validateConfirmPassword,
} from "@/lib/auth/validation"

type Props = React.ComponentProps<"div"> & {
  token: string
}

type FieldErrors = {
  password?: string | null
  confirmPassword?: string | null
}

export function ResetPasswordForm({ token, className, ...props }: Props) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)

  const tokenMissing = token.length === 0

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((prev) =>
      prev[field] ? { ...prev, [field]: null } : prev,
    )
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (tokenMissing) {
      setError("Reset token is missing from the URL")
      return
    }

    const passwordErr = validatePassword(password)
    const confirmErr = validateConfirmPassword(password, confirmPassword)
    if (passwordErr || confirmErr) {
      setFieldErrors({
        password: passwordErr,
        confirmPassword: confirmErr,
      })
      return
    }

    setFieldErrors({})
    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? "Reset failed")
        return
      }
      setMessage("Password updated. Redirecting to sign in...")
      setTimeout(() => router.push("/login"), 1500)
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl"> Set a new password </CardTitle>
          <CardDescription>
            Choose a new password for your Get Domus TM account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              {tokenMissing && !error && (
                <FormMessage
                  type="error"
                  message="Reset token is missing from the URL"
                />
              )}
              {error && <FormMessage type="error" message={error} />}
              {message && <FormMessage type="success" message={message} />}

              <Field>
                <FieldLabel htmlFor="password">New password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    clearFieldError("password")
                    if (confirmPassword) clearFieldError("confirmPassword")
                  }}
                  onBlur={() =>
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: validatePassword(password),
                    }))
                  }
                />
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
                {fieldErrors.password && (
                  <FormMessage
                    type="error"
                    message={fieldErrors.password}
                    compact
                  />
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirm new password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    clearFieldError("confirmPassword")
                  }}
                  onBlur={() =>
                    setFieldErrors((prev) => ({
                      ...prev,
                      confirmPassword: validateConfirmPassword(
                        password,
                        confirmPassword,
                      ),
                    }))
                  }
                />
                {fieldErrors.confirmPassword && (
                  <FormMessage
                    type="error"
                    message={fieldErrors.confirmPassword}
                    compact
                  />
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  disabled={loading || tokenMissing}
                  className="bg-orange-500 text-white hover:bg-orange-600"
                >
                  {loading ? "Updating..." : "Update password"}
                </Button>

                <FieldDescription className="text-center">
                  Remembered your password? <Link href="/login">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
