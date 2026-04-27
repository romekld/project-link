"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ChevronLeft, Loader2 } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { WizardProgress } from "./components/wizard-progress"
import { StepHouseholdInfo } from "./components/step-household-info"
import { StepMemberRoster } from "./components/step-member-roster"
import { StepReview } from "./components/step-review"
import type { HouseholdInfoValues, MemberValues } from "./data/form-schema"
import { createHousehold } from "@/features/bhw/households/actions/create-household"

const STEP_1_FORM_ID = "wizard-step-household-info"

type HhProfileWizardProps = {
  mode: "create" | "update"
  quarterLabel: string
}

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 48 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -48 }),
}

export function HhProfileWizard({ mode, quarterLabel }: HhProfileWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [householdInfo, setHouseholdInfo] = useState<HouseholdInfoValues | null>(null)
  const [members, setMembers] = useState<MemberValues[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  function scrollToTop() {
    document.querySelector<HTMLElement>("[data-dashboard-scroll]")?.scrollTo({ top: 0, behavior: "smooth" })
  }

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1)
    setStep(next)
    scrollToTop()
  }

  function handleHouseholdInfoNext(values: HouseholdInfoValues) {
    setHouseholdInfo(values)
    goTo(2)
  }

  function handleBack() {
    goTo(step - 1)
  }

  async function handleSubmit() {
    if (!householdInfo) return
    setIsSubmitting(true)

    const result = await createHousehold({
      ...householdInfo,
      members,
    })

    setIsSubmitting(false)

    if ("error" in result) {
      toast.error(`Failed to save: ${result.error}`)
      return
    }

    toast.success("Household saved and submitted for review.")
    router.push("/bhw/households")
  }

  const title = mode === "create" ? "New HH Profile" : `Update HH Profile — ${quarterLabel}`

  return (
    <section className="flex flex-col gap-4">
      {/* Wizard header */}
      <div>
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

        <div className="mt-3">
          <WizardProgress currentStep={step} />
        </div>
      </div>

      {/* Animated step content */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {step === 1 && (
              <StepHouseholdInfo
                formId={STEP_1_FORM_ID}
                defaultValues={householdInfo ?? undefined}
                quarterLabel={quarterLabel}
                onNext={handleHouseholdInfoNext}
              />
            )}
            {step === 2 && (
              <StepMemberRoster
                members={members}
                onMembersChange={setMembers}
              />
            )}
            {step === 3 && householdInfo && (
              <StepReview
                householdInfo={householdInfo}
                members={members}
                quarterLabel={quarterLabel}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky navigation footer — sits above bottom nav on mobile */}
      <div className="sticky bottom-0 z-20 -mx-4 border-t bg-background px-4 py-3 md:-mx-6 md:px-6">
        {step === 1 && (
          <Button type="submit" form={STEP_1_FORM_ID} size="lg" className="w-full">
            Continue to Members
          </Button>
        )}
        {step === 2 && (
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="lg" className="flex-1" onClick={handleBack}>
              Back
            </Button>
            <Button
              type="button"
              size="lg"
              className="flex-1"
              onClick={() => goTo(3)}
              disabled={members.length === 0}
            >
              Review
            </Button>
          </div>
        )}
        {step === 3 && (
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button type="button" size="lg" className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 size-4 animate-spin" />Saving…</>
              ) : (
                "Save & Submit"
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
