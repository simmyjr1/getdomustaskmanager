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
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "@/lib/auth/validation"

type FieldErrors = {
  email?: string | null
  password?: string | null
  confirmPassword?: string | null
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((prev) =>
      prev[field] ? { ...prev, [field]: null } : prev,
    )
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)
    const confirmErr = validateConfirmPassword(password, confirmPassword)

    if (emailErr || passwordErr || confirmErr) {
      setFieldErrors({
        email: emailErr,
        password: passwordErr,
        confirmPassword: confirmErr,
      })
      return
    }

    setFieldErrors({})
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: name.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? "Sign up failed")
        return
      }
      await res.json().catch(() => null)
      router.push("/dashboard")
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
          <CardTitle className="text-xl"> Create your account </CardTitle>
          <CardDescription>
            Sign up for your Get Domus TM account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              {error && <FormMessage type="error" message={error} />}

              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    clearFieldError("email")
                  }}
                  onBlur={() =>
                    setFieldErrors((prev) => ({
                      ...prev,
                      email: validateEmail(email),
                    }))
                  }
                />
                {fieldErrors.email && (
                  <FormMessage
                    type="error"
                    message={fieldErrors.email}
                    compact
                  />
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
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
                  Confirm Password
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
                  disabled={loading}
                  className="bg-orange-500 text-white hover:bg-orange-600"
                >
                  {loading ? "Creating account..." : "Create account"}
                </Button>

                <FieldDescription className="text-center">
                  Already have an account? <Link href="/login">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
