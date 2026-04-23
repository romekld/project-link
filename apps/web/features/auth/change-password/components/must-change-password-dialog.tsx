"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { changePasswordAction } from "../actions"

type MustChangePasswordDialogProps = {
  initialOpen?: boolean
}

export function MustChangePasswordDialog({
  initialOpen = false,
}: MustChangePasswordDialogProps) {
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)
  const [state, action, isPending] = useActionState(changePasswordAction, null)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const successFired = useRef(false)
  const formId = "must-change-password-form"
  const open = initialOpen && !dismissed && !state?.success

  useEffect(() => {
    if (state?.success && !successFired.current) {
      successFired.current = true
      toast.success("Password updated. You're all set!")
      router.refresh()
    }
  }, [state, router])

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setDismissed(true)
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change your temporary password</DialogTitle>
          <DialogDescription>
            For security, update your password soon. You can skip this for now and continue.
          </DialogDescription>
        </DialogHeader>

        <form id={formId} action={action} className="flex flex-col gap-6">
          <FieldGroup>
            {state?.error && (
              <Alert variant="destructive" className="p-3">
                <AlertCircleIcon />
                <AlertDescription className="text-xs">{state.error}</AlertDescription>
              </Alert>
            )}

            <Field>
              <FieldLabel htmlFor="newPassword">New password</FieldLabel>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNew ? "text" : "password"}
                  placeholder="At least 12 characters"
                  required
                  autoComplete="new-password"
                  className="h-9 bg-background pr-11"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-1 my-auto size-8 transition-none active:translate-y-0"
                  onClick={() => setShowNew((value) => !value)}
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <EyeOffIcon /> : <EyeIcon />}
                </Button>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your new password"
                  required
                  autoComplete="new-password"
                  className="h-9 bg-background pr-11"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-1 my-auto size-8 transition-none active:translate-y-0"
                  onClick={() => setShowConfirm((value) => !value)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </Button>
              </div>
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button type="button" variant="ghost" disabled={isPending} onClick={() => setDismissed(true)}>
            Skip for now
          </Button>
          <Button type="submit" form={formId} disabled={isPending}>
            {isPending ? "Saving..." : "Set Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}