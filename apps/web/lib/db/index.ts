import Dexie, { type Table } from "dexie"
import type {
  HouseholdInfoValues,
  MemberValues,
} from "@/features/bhw/households/hh-profile-wizard/data/form-schema"

export interface HhDraft {
  localId: string
  syncStatus: "draft" | "pending_sync" | "error"
  syncError?: string
  householdInfo: HouseholdInfoValues | null
  members: MemberValues[]
  updatedAt: number
}

class ProjectLinkDb extends Dexie {
  hhDrafts!: Table<HhDraft, string>

  constructor() {
    super("project-link-db")
    this.version(1).stores({
      hhDrafts: "localId, syncStatus",
    })
  }
}

export const db = new ProjectLinkDb()
