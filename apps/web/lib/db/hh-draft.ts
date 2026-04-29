import type {
  HouseholdInfoValues,
  MemberValues,
} from "@/features/bhw/households/hh-profile-wizard/data/form-schema"
import { db, type HhDraft } from "./index"

export async function loadExistingDraft(): Promise<HhDraft | null> {
  const draft = await db.hhDrafts
    .where("syncStatus")
    .anyOf(["draft", "error"])
    .first()
  return draft ?? null
}

export async function saveDraftStep(
  localId: string,
  patch: Partial<Omit<HhDraft, "localId" | "syncStatus" | "updatedAt">>
): Promise<void> {
  const existing = await db.hhDrafts.get(localId)
  await db.hhDrafts.put({
    localId,
    syncStatus: "draft",
    householdInfo: null,
    members: [],
    ...existing,
    ...patch,
    updatedAt: Date.now(),
  })
}

export async function markPendingSync(
  localId: string,
  householdInfo: HouseholdInfoValues,
  members: MemberValues[]
): Promise<void> {
  await db.hhDrafts.put({
    localId,
    syncStatus: "pending_sync",
    householdInfo,
    members,
    updatedAt: Date.now(),
  })
}

export async function discardDraft(localId: string): Promise<void> {
  await db.hhDrafts.delete(localId)
}
