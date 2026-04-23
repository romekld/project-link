import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  { id: 1, label: "Household Info" },
  { id: 2, label: "Members" },
  { id: 3, label: "Review" },
]

type WizardProgressProps = {
  currentStep: number
}

export function WizardProgress({ currentStep }: WizardProgressProps) {
  return (
    <nav aria-label="Wizard steps" className="flex items-center gap-2">
      {STEPS.map((step, index) => {
        const isCompleted = currentStep > step.id
        const isActive = currentStep === step.id
        return (
          <div key={step.id} className="flex flex-1 items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  isCompleted && "bg-primary text-primary-foreground",
                  isActive && "border-2 border-primary bg-background text-primary",
                  !isCompleted && !isActive && "border border-border bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="size-3.5" /> : step.id}
              </div>
              <span
                className={cn(
                  "hidden text-[10px] font-medium sm:block",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "mb-4 h-px flex-1 transition-colors sm:mb-0",
                  isCompleted ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
