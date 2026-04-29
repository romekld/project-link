import "fake-indexeddb/auto"
import { beforeEach, describe, expect, it } from "vitest"
import { db } from "./index"
import {
  discardDraft,
  loadExistingDraft,
  markPendingSync,
  saveDraftStep,
} from "./hh-draft"
import type {
  HouseholdInfoValues,
  MemberValues,
} from "@/features/bhw/households/hh-profile-wizard/data/form-schema"

const mockInfo: HouseholdInfoValues = {
  visitDate: "2026-04-29",
  respondentLastName: "Santos",
  respondentFirstName: "Maria",
  nhtsStatus: "Non-NHTS",
  isIndigenousPeople: false,
  hhHeadPhilhealthMember: false,
  houseNoStreet: "123 Main St",
  barangayId: "00000000-0000-0000-0000-000000000001",
}

const mockMember: MemberValues = {
  id: "m1",
  memberLastName: "Santos",
  memberFirstName: "Juan",
  relationshipToHhHead: "3-Son",
  sex: "M",
  dateOfBirth: "2012-01-15",
  dobEstimated: false,
}

beforeEach(async () => {
  await db.hhDrafts.clear()
})

describe("loadExistingDraft", () => {
  it("returns null when no draft exists", async () => {
    expect(await loadExistingDraft()).toBeNull()
  })

  it("returns a draft record when one exists with status draft", async () => {
    await db.hhDrafts.put({
      localId: "test-id",
      syncStatus: "draft",
      householdInfo: mockInfo,
      members: [],
      updatedAt: Date.now(),
    })
    const result = await loadExistingDraft()
    expect(result?.localId).toBe("test-id")
  })

  it("returns error-status records too", async () => {
    await db.hhDrafts.put({
      localId: "err-id",
      syncStatus: "error",
      syncError: "server error",
      householdInfo: mockInfo,
      members: [],
      updatedAt: Date.now(),
    })
    expect(await loadExistingDraft()).not.toBeNull()
  })

  it("does not return pending_sync records", async () => {
    await db.hhDrafts.put({
      localId: "sync-id",
      syncStatus: "pending_sync",
      householdInfo: mockInfo,
      members: [],
      updatedAt: Date.now(),
    })
    expect(await loadExistingDraft()).toBeNull()
  })
})

describe("saveDraftStep", () => {
  it("creates a new draft record", async () => {
    await saveDraftStep("new-id", { householdInfo: mockInfo })
    const saved = await db.hhDrafts.get("new-id")
    expect(saved?.syncStatus).toBe("draft")
    expect(saved?.householdInfo?.respondentLastName).toBe("Santos")
  })

  it("updates an existing record without overwriting other fields", async () => {
    await saveDraftStep("my-id", { householdInfo: mockInfo })
    await saveDraftStep("my-id", { members: [mockMember] })
    const saved = await db.hhDrafts.get("my-id")
    expect(saved?.householdInfo?.respondentLastName).toBe("Santos")
    expect(saved?.members).toHaveLength(1)
  })
})

describe("markPendingSync", () => {
  it("sets syncStatus to pending_sync with full data", async () => {
    await markPendingSync("p-id", mockInfo, [])
    const saved = await db.hhDrafts.get("p-id")
    expect(saved?.syncStatus).toBe("pending_sync")
    expect(saved?.householdInfo).toEqual(mockInfo)
  })
})

describe("discardDraft", () => {
  it("deletes the record", async () => {
    await saveDraftStep("del-id", { householdInfo: mockInfo })
    await discardDraft("del-id")
    expect(await db.hhDrafts.get("del-id")).toBeUndefined()
  })

  it("is a no-op when record does not exist", async () => {
    await expect(discardDraft("nonexistent")).resolves.not.toThrow()
  })
})
