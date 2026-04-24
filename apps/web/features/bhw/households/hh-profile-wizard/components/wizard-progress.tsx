"use client"

import { motion } from "framer-motion"
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
    <nav aria-label="Wizard steps" className="flex items-start gap-2">
      {STEPS.map((step, index) => {
        const isCompleted = currentStep > step.id
        const isActive = currentStep === step.id
        return (
          <div key={step.id} className="flex flex-1 items-start gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                aria-current={isActive ? "step" : undefined}
                initial={false}
                animate={{
                  scale: isActive ? 1.08 : 1,
                  backgroundColor: isCompleted
                    ? "var(--color-primary)"
                    : isActive
                      ? "var(--color-background)"
                      : "var(--color-muted)",
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                  isCompleted && "text-primary-foreground",
                  isActive && "border-2 border-primary text-primary",
                  !isCompleted && !isActive && "border border-border text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.18, ease: "backOut" }}
                  >
                    <Check className="size-3.5" />
                  </motion.span>
                ) : (
                  step.id
                )}
              </motion.div>

              <span
                className={cn(
                  "text-center text-[10px] font-medium leading-tight",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div className="relative mt-3.5 h-px flex-1">
                <div className="absolute inset-0 bg-border" />
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary"
                  initial={false}
                  animate={{ width: isCompleted ? "100%" : "0%" }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
