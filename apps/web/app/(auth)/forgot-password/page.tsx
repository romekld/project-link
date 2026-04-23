import Link from "next/link"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ShieldCheckIcon } from "lucide-react"

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl items-center p-6 md:p-10">
      <div className="w-full space-y-6 rounded-xl border bg-background p-6 md:p-8">
        <div className="space-y-1 text-left">
          <h1 className="font-heading text-2xl">Forgot password</h1>
          <p className="text-sm text-muted-foreground">
            Password reset is handled by authorized administrators for this health system.
          </p>
        </div>

        <Alert>
          <ShieldCheckIcon />
          <AlertTitle>Administrator-assisted account recovery</AlertTitle>
          <AlertDescription>
            Please contact your City Health Office II administrator to recover your account access.
          </AlertDescription>
        </Alert>

        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    </div>
  )
}
