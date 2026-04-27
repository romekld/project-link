import Dexie, { type Table } from "dexie"

export type LocalSyncStatus =
  | "draft"
  | "pending_sync"
  | "pending_validation"
  | "returned"
  | "validated"

export type LocalHouseholdMember = {
  localId: string
  householdLocalId: string
  memberLastName: string
  memberFirstName: string
  memberMiddleName?: string
  memberMothersMaidenName?: string
  relationshipToHhHead: "1-Head" | "2-Spouse" | "3-Son" | "4-Daughter" | "5-Others"
  sex: "M" | "F"
  dateOfBirth: string
  dobEstimated: boolean
  classificationQ1?: string
  memberPhilhealthId?: string
  memberRemarks?: string
}

export type LocalHousehold = {
  localId: string
  remoteId?: string
  syncStatus: LocalSyncStatus
  assignedBhwId?: string
  respondentLastName: string
  respondentFirstName: string
  respondentMiddleName?: string
  nhtsStatus: "NHTS-4Ps" | "Non-NHTS"
  isIndigenousPeople: boolean
  hhHeadPhilhealthMember: boolean
  hhHeadPhilhealthId?: string
  hhHeadPhilhealthCategory?: string
  houseNoStreet: string
  purok?: string
  barangayId: string
  barangayName?: string
  latitude?: number | null
  longitude?: number | null
  visitDate: string
  year: number
  updatedAt: string
}

class AppDatabase extends Dexie {
  households!: Table<LocalHousehold, string>
  householdMembers!: Table<LocalHouseholdMember, string>

  constructor() {
    super("project-link-bhw")
    this.version(1).stores({
      households: "localId, syncStatus, assignedBhwId, updatedAt",
      householdMembers: "localId, householdLocalId",
    })
  }
}

export const db = new AppDatabase()
