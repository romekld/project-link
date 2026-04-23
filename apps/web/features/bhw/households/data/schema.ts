export type SyncStatus = "draft" | "pending_sync" | "pending_validation" | "returned" | "validated"

export type Quarter = "Q1" | "Q2" | "Q3" | "Q4"

export type ClassificationCode =
  | "N" | "I" | "U" | "S" | "A"
  | "P" | "AP" | "PP" | "WRA"
  | "SC" | "PWD" | "AB"

export type Sex = "M" | "F"

export type RelationshipToHead =
  | "1-Head"
  | "2-Spouse"
  | "3-Son"
  | "4-Daughter"
  | "5-Others"

export type NhtsStatus = "NHTS-4Ps" | "Non-NHTS"

export type PhilHealthCategory =
  | "Formal Economy"
  | "Informal Economy"
  | "Indigent/Sponsored"
  | "Senior Citizen"
  | "Other"

export type HouseholdMember = {
  id: string
  memberLastName: string
  memberFirstName: string
  memberMiddleName?: string
  memberMothersMaidenName?: string
  relationshipToHhHead: RelationshipToHead
  sex: Sex
  dateOfBirth: string
  dobEstimated: boolean
  classificationQ1?: ClassificationCode
  classificationQ2?: ClassificationCode
  classificationQ3?: ClassificationCode
  classificationQ4?: ClassificationCode
  memberPhilhealthId?: string
  memberRemarks?: string
}

export type Household = {
  id: string
  householdNumber: string
  healthStationId: string
  assignedBhwId: string
  respondentLastName: string
  respondentFirstName: string
  respondentMiddleName?: string
  nhtsStatus: NhtsStatus
  isIndigenousPeople: boolean
  hhHeadPhilhealthMember: boolean
  hhHeadPhilhealthId?: string
  hhHeadPhilhealthCategory?: PhilHealthCategory
  visitDateQ1?: string
  visitDateQ2?: string
  visitDateQ3?: string
  visitDateQ4?: string
  year: number
  syncStatus: SyncStatus
  returnedReason?: string
  members: HouseholdMember[]
  lastUpdated: string
}
