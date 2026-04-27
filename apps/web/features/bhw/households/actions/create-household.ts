"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const memberInputSchema = z.object({
  id: z.string(),
  memberLastName: z.string().min(1),
  memberFirstName: z.string().min(1),
  memberMiddleName: z.string().optional(),
  memberMothersMaidenName: z.string().optional(),
  relationshipToHhHead: z.enum(["1-Head", "2-Spouse", "3-Son", "4-Daughter", "5-Others"]),
  sex: z.enum(["M", "F"]),
  dateOfBirth: z.string().min(1),
  dobEstimated: z.boolean(),
  classificationQ1: z.string().optional(),
  memberPhilhealthId: z.string().optional(),
  memberRemarks: z.string().optional(),
})

const createHouseholdSchema = z.object({
  visitDate: z.string().min(1),
  respondentLastName: z.string().min(1),
  respondentFirstName: z.string().min(1),
  respondentMiddleName: z.string().optional(),
  nhtsStatus: z.enum(["NHTS-4Ps", "Non-NHTS"]),
  isIndigenousPeople: z.boolean(),
  hhHeadPhilhealthMember: z.boolean(),
  hhHeadPhilhealthId: z.string().optional(),
  hhHeadPhilhealthCategory: z
    .enum(["Formal Economy", "Informal Economy", "Indigent/Sponsored", "Senior Citizen", "Other"])
    .optional(),
  houseNoStreet: z.string().min(1),
  purok: z.string().optional(),
  barangayId: z.string().uuid(),
  barangayName: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  localId: z.string().optional(),
  members: z.array(memberInputSchema),
})

export type CreateHouseholdInput = z.infer<typeof createHouseholdSchema>

export async function createHousehold(
  input: CreateHouseholdInput
): Promise<{ id: string } | { error: string }> {
  const parsed = createHouseholdSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("health_station_id")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) return { error: "Profile not found" }

  const d = parsed.data

  // NOTE: `households` and `household_members` tables are not yet present in the
  // generated Supabase Database type. Cast to `any` so this server action compiles
  // until `pnpm exec supabase gen types` is re-run after the migration.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const { data: household, error: hhError } = await sb
    .from("households")
    .insert({
      local_id: d.localId,
      health_station_id: profile.health_station_id,
      assigned_bhw_id: user.id,
      respondent_last_name: d.respondentLastName,
      respondent_first_name: d.respondentFirstName,
      respondent_middle_name: d.respondentMiddleName,
      nhts_status: d.nhtsStatus,
      is_indigenous_people: d.isIndigenousPeople,
      hh_head_philhealth_member: d.hhHeadPhilhealthMember,
      hh_head_philhealth_id: d.hhHeadPhilhealthId,
      hh_head_philhealth_category: d.hhHeadPhilhealthCategory,
      house_no_street: d.houseNoStreet,
      purok: d.purok,
      barangay_id: d.barangayId,
      latitude: d.latitude ?? null,
      longitude: d.longitude ?? null,
      visit_date_q1: d.visitDate,
      sync_status: "pending_validation",
    })
    .select("id")
    .single()

  if (hhError || !household) {
    return { error: hhError?.message ?? "Failed to create household" }
  }

  if (d.members.length > 0) {
    const memberRows = d.members.map((m) => ({
      household_id: household.id,
      local_id: m.id,
      member_last_name: m.memberLastName,
      member_first_name: m.memberFirstName,
      member_middle_name: m.memberMiddleName,
      member_mothers_maiden_name: m.memberMothersMaidenName,
      relationship_to_hh_head: m.relationshipToHhHead,
      sex: m.sex,
      date_of_birth: m.dateOfBirth,
      dob_estimated: m.dobEstimated,
      classification_q1: m.classificationQ1 ?? null,
      member_philhealth_id: m.memberPhilhealthId,
      member_remarks: m.memberRemarks,
    }))

    const { error: membersError } = await sb
      .from("household_members")
      .insert(memberRows)

    if (membersError) return { error: membersError.message }
  }

  return { id: household.id }
}
