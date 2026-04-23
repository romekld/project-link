"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WizardProgress } from "./components/wizard-progress"
import { StepHouseholdInfo } from "./components/step-household-info"
import { StepMemberRoster } from "./components/step-member-roster"
import { StepReview } from "./components/step-review"
import type { HouseholdInfoValues, MemberValues } from "./data/form-schema"

type HhProfileWizardProps = {
  mode: "create" | "update"
  quarterLabel: string
}

export function HhProfileWizard({ mode, quarterLabel }: HhProfileWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [householdInfo, setHouseholdInfo] = useState<HouseholdInfoValues | null>(null)
  const [members, setMembers] = useState<MemberValues[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleHouseholdInfoNext(values: HouseholdInfoValues) {
    setHouseholdInfo(values)
    setStep(2)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleMembersNext() {
    setStep(3)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleBack() {
    setStep((s) => s - 1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
    toast.success("HH Profile saved locally. Will sync when online.")
    router.push("/bhw/households")
  }

  const title = mode === "create" ? "New HH Profile" : `Update HH Profile — ${quarterLabel}`

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0"
          onClick={() => (step === 1 ? router.back() : handleBack())}
          aria-label="Go back"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="font-heading text-xl font-bold tracking-tight">{title}</h1>
          <p className="text-xs text-muted-foreground">Step {step} of 3</p>
        </div>
      </div>

      <WizardProgress currentStep={step} />

      {step === 1 && (
        <StepHouseholdInfo
          defaultValues={householdInfo ?? undefined}
          quarterLabel={quarterLabel}
          onNext={handleHouseholdInfoNext}
        />
      )}

      {step === 2 && (
        <StepMemberRoster
          members={members}
          onMembersChange={setMembers}
          onNext={handleMembersNext}
          onBack={handleBack}
        />
      )}

      {step === 3 && householdInfo && (
        <StepReview
          householdInfo={householdInfo}
          members={members}
          quarterLabel={quarterLabel}
          onSubmit={handleSubmit}
          onBack={handleBack}
          isSubmitting={isSubmitting}
        />
      )}
    </section>
  )
}
