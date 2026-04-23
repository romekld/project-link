'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

type ActionResult = { success: true } | { error: string }

async function getActorId(): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

/**
 * Applies a batch of staged coverage scope changes.
 * Called when the user confirms in CoverageApplyDialog.
 *
 * stagedChanges: Record<pcode, 'add' | 'remove'>
 */
export async function applyCoverageChangesAction(
  stagedChanges: Record<string, 'add' | 'remove'>,
  batchReason: string
): Promise<ActionResult> {
  if (!batchReason.trim()) {
    return { error: 'Batch reason is required' }
  }

  const entries = Object.entries(stagedChanges)
  if (entries.length === 0) {
    return { error: 'No staged changes to apply' }
  }

  const actorId = await getActorId()
  if (!actorId) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  const supabase = await createClient()

  // Resolve pcodes → city_barangay UUIDs in a single query.
  const pcodes = entries.map(([pcode]) => pcode)

  const { data: cityBarangays, error: lookupError } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('city_barangays' as any)
    .select('id, pcode')
    .in('pcode', pcodes)

  if (lookupError) return { error: lookupError.message }

  const pcodeToId = Object.fromEntries(
    ((cityBarangays ?? []) as unknown as { id: string; pcode: string }[]).map(
      (cb) => [cb.pcode, cb.id]
    )
  )

  for (const [pcode, action] of entries) {
    const cityBarangayId = pcodeToId[pcode]
    if (!cityBarangayId) {
      return { error: `City barangay not found for pcode: ${pcode}` }
    }

    const { error } = await admin.rpc(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'apply_barangay_coverage_change' as any,
      {
        p_actor_id: actorId,
        p_city_barangay_id: cityBarangayId,
        p_action: action,
        p_reason: batchReason,
      }
    )

    if (error) return { error: `Failed to ${action} ${pcode}: ${error.message}` }
  }

  revalidatePath('/admin/health-stations/city-barangays')
  revalidatePath('/cho/health-stations/city-barangays')
  return { success: true }
}
