"use client"

import Link from "next/link"
import * as React from "react"
import { useActionState } from "react"
import { ShieldCheckIcon, EyeIcon, EyeOffIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { loginAction } from "../actions"

export function LoginForm({
  className,
}: React.ComponentProps<"form">) {
  const [state, action, pending] = useActionState(loginAction, null)
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <form action={action} className={cn("flex flex-col gap-6", className)}>
      <FieldGroup>
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-2xl font-heading font-bold">Login</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your credentials to continue
          </p>
        </div>
        {state?.error && (
          <Alert variant="destructive" className="p-3">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@cho2.gov.ph"
            required
            className="h-10 bg-background"
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              required
              className="h-10 bg-background pr-11"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute inset-y-0 right-1 my-auto size-8 transition-none active:translate-y-0"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </Button>
          </div>
        </Field>
        <Field>
          <Button type="submit" className="h-9" disabled={pending}>
            {pending ? "Logging in…" : "Login"}
          </Button>
        </Field>
        <Alert className="p-3">
          <ShieldCheckIcon />
          <AlertTitle>Authorized Health Personnel Only</AlertTitle>
          <AlertDescription className="text-xs">
            Accounts are created by system admin only.
          </AlertDescription>
        </Alert>
      </FieldGroup>
    </form>
  )
}