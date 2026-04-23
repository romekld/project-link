import type { SyncStatus } from "./schema"

export const syncStatusConfig: Record<
  SyncStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  draft: { label: "Draft", variant: "outline" },
  pending_sync: { label: "Pending Sync", variant: "secondary" },
  pending_validation: { label: "Pending Review", variant: "secondary" },
  returned: { label: "Returned", variant: "destructive" },
  validated: { label: "Synced", variant: "default" },
}

export function computeAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age
}

export function formatVisitQuartersSummary(
  q1?: string,
  q2?: string,
  q3?: string,
  q4?: string
): string {
  const done = [q1 && "Q1", q2 && "Q2", q3 && "Q3", q4 && "Q4"].filter(Boolean)
  if (done.length === 0) return "No visits recorded"
  return done.join(" · ") + " done"
}
