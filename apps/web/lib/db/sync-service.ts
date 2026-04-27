import { db } from "./dexie"
import { createHousehold } from "@/features/bhw/households/actions/create-household"

export async function syncPending(): Promise<void> {
  const pending = await db.households
    .where("syncStatus")
    .equals("pending_sync")
    .toArray()

  for (const hh of pending) {
    const members = await db.householdMembers
      .where("householdLocalId")
      .equals(hh.localId)
      .toArray()

    const result = await createHousehold({
      visitDate: hh.visitDate,
      respondentLastName: hh.respondentLastName,
      respondentFirstName: hh.respondentFirstName,
      respondentMiddleName: hh.respondentMiddleName,
      nhtsStatus: hh.nhtsStatus,
      isIndigenousPeople: hh.isIndigenousPeople,
      hhHeadPhilhealthMember: hh.hhHeadPhilhealthMember,
      hhHeadPhilhealthId: hh.hhHeadPhilhealthId,
      hhHeadPhilhealthCategory: hh.hhHeadPhilhealthCategory as any,
      houseNoStreet: hh.houseNoStreet,
      purok: hh.purok,
      barangayId: hh.barangayId,
      barangayName: hh.barangayName,
      latitude: hh.latitude,
      longitude: hh.longitude,
      localId: hh.localId,
      members: members.map((m) => ({
        id: m.localId,
        memberLastName: m.memberLastName,
        memberFirstName: m.memberFirstName,
        memberMiddleName: m.memberMiddleName,
        memberMothersMaidenName: m.memberMothersMaidenName,
        relationshipToHhHead: m.relationshipToHhHead,
        sex: m.sex,
        dateOfBirth: m.dateOfBirth,
        dobEstimated: m.dobEstimated,
        classificationQ1: m.classificationQ1,
        memberPhilhealthId: m.memberPhilhealthId,
        memberRemarks: m.memberRemarks,
      })),
    })

    if ("id" in result) {
      await db.households.update(hh.localId, {
        syncStatus: "pending_validation",
        remoteId: result.id,
      })
    }
    // On error: leave as pending_sync — retry next call
  }
}
