import type { ClassificationCode, Sex } from "../../data/schema"

type ClassificationOption = {
  code: ClassificationCode
  label: string
  description: string
}

export const classificationOptions: ClassificationOption[] = [
  { code: "N", label: "N — Newborn", description: "0–28 days old" },
  { code: "I", label: "I — Infant", description: "29 days – 11 months old" },
  { code: "U", label: "U — Under-five Child", description: "1–4 years old (12–59 months)" },
  { code: "S", label: "S — School-Aged Child", description: "5–9 years old" },
  { code: "A", label: "A — Adolescent", description: "10–19 years old" },
  { code: "P", label: "P — Pregnant", description: "Any pregnant woman" },
  { code: "AP", label: "AP — Adolescent-Pregnant", description: "Pregnant AND 10–19 years old" },
  { code: "PP", label: "PP — Post-Partum", description: "Gave birth in the last 6 weeks" },
  { code: "WRA", label: "WRA — Women of Reproductive Age", description: "Female, 15–49 y/o, not pregnant or postpartum" },
  { code: "SC", label: "SC — Senior Citizen", description: "60 years old and above" },
  { code: "PWD", label: "PWD — Person with Disability", description: "Any age" },
  { code: "AB", label: "AB — Adult", description: "20–59 years old" },
]

export function computeAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age
}

export function computeAgeDays(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth)
  const today = new Date()
  return Math.floor((today.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24))
}

export function autoSuggestClassification(
  dateOfBirth: string,
  sex: Sex
): ClassificationCode | undefined {
  if (!dateOfBirth) return undefined

  const ageDays = computeAgeDays(dateOfBirth)
  const age = computeAge(dateOfBirth)

  if (ageDays < 0) return undefined
  if (ageDays <= 28) return "N"
  if (age < 1) return "I"
  if (age < 5) return "U"
  if (age < 10) return "S"
  if (age < 20) return "A"
  if (age >= 60) return "SC"

  if (sex === "F") {
    if (age >= 15 && age <= 49) return "WRA"
  }

  if (age >= 20 && age <= 59) return "AB"

  return undefined
}
