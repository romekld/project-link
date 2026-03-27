import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { HeartPulse, Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { ROLE_HOME } from '@/features/auth/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface LoginFormValues {
  identifier: string
  password: string
}

export function LoginPage() {
  const { signIn } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>()

  async function onSubmit(values: LoginFormValues) {
    setServerError(null)
    const { error } = await signIn(values.identifier.trim(), values.password)
    if (error) {
      setServerError(error)
      return
    }
    // Redirect to role home. TanStack Router (Wave 3) replaces this.
    const session = await import('@/lib/supabase').then(m => m.supabase.auth.getSession())
    const claims = session.data.session?.user.app_metadata ?? {}
    const role = claims.role as keyof typeof ROLE_HOME | undefined
    window.location.href = role && ROLE_HOME[role] ? ROLE_HOME[role] : '/'
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left panel — login form */}
      <div className="flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-16">
        {/* Logo header */}
        <div className="mb-10 flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HeartPulse className="size-3.5" />
          </span>
          <span className="font-heading text-sm font-semibold tracking-tight">Project LINK</span>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="mb-6">
            <h1 className="font-heading text-2xl font-bold tracking-tight">Log in to your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your email or username and password.
            </p>
          </div>

          {serverError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="identifier">Email or username</FieldLabel>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="you@example.com or s.redona_kld"
                  autoComplete="username"
                  aria-invalid={!!errors.identifier}
                  {...register('identifier', {
                    required: 'Enter your email address or username',
                  })}
                />
                {errors.identifier && (
                  <p className="mt-1 text-xs text-destructive">{errors.identifier.message}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="pr-10"
                    aria-invalid={!!errors.password}
                    {...register('password', {
                      required: 'Enter your password',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
                )}
              </Field>

              <Field>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {isSubmitting ? 'Signing in…' : 'Sign in'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </div>
      </div>

      {/* Right panel — branding (hidden on mobile) */}
      <div className="hidden bg-primary lg:flex lg:flex-col lg:items-center lg:justify-center lg:px-16 lg:text-primary-foreground">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary-foreground/10">
          <HeartPulse className="size-6 text-primary-foreground" />
        </div>
        <h2 className="mt-6 text-center font-heading text-3xl font-bold tracking-tight">
          Project LINK
        </h2>
        <p className="mt-3 text-center text-sm text-primary-foreground/70">
          Local Information Network<br />for Kalusugan
        </p>
        <p className="mt-8 text-center text-xs text-primary-foreground/50">
          City Health Office II<br />Dasmariñas City
        </p>
      </div>
    </div>
  )
}
