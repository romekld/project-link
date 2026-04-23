export type SyncRecord = {
  id: string
  householdNumber: string
  respondentName: string
  status: "pending_sync" | "returned"
  returnedReason?: string
  lastUpdated: string
  ageLabel: string
}

export const mockSyncQueue: SyncRecord[] = [
  {
    id: "hh-002",
    householdNumber: "BHS01-2026-0002",
    respondentName: "Santos, Maria",
    status: "returned",
    returnedReason:
      "Missing PhilHealth information for members aged 21 and above. Please update before resubmitting.",
    lastUpdated: "2026-04-09T10:15:00Z",
    ageLabel: "Returned 3 days ago",
  },
  {
    id: "hh-005",
    householdNumber: "BHS01-2026-0005",
    respondentName: "Villanueva, Jose",
    status: "returned",
    returnedReason: "Date of birth is missing for one household member. Please complete all entries.",
    lastUpdated: "2026-04-10T08:00:00Z",
    ageLabel: "Returned 2 days ago",
  },
  {
    id: "hh-006",
    householdNumber: "BHS01-2026-0006",
    respondentName: "Mendoza, Clara",
    status: "pending_sync",
    lastUpdated: "2026-04-12T09:00:00Z",
    ageLabel: "2 hours ago",
  },
  {
    id: "hh-007",
    householdNumber: "BHS01-2026-0007",
    respondentName: "Torres, Belen",
    status: "pending_sync",
    lastUpdated: "2026-04-12T10:30:00Z",
    ageLabel: "47 min ago",
  },
  {
    id: "hh-008",
    householdNumber: "BHS01-2026-0008",
    respondentName: "Ramos, Antonio",
    status: "pending_sync",
    lastUpdated: "2026-04-12T10:55:00Z",
    ageLabel: "just now",
  },
]
