import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * The single write path for blocking a user.
 *
 * History (mobile repo, PHASE_0 Story 0.6): two components each carried their
 * own insert against `blocked_users` — a table that does not exist (the real
 * table is `blocks`) — so blocking silently never worked. Keeping the table
 * name in exactly one place is the point of this module.
 *
 * The block row is `blocks (blocker_id, blocked_id)`. A `reason` is NOT a
 * column on `blocks`: a reasoned block is a block plus a report, so the reason
 * is filed to `reports` (`target_type = 'profile'`) — both feed the reward
 * function's `− block / report / flag` input.
 *
 * Backend guarantees (migration 20260717120000, pgTAP-proven): the insert
 * severs any pending/accepted connection with the target and profile
 * visibility is gated in both directions.
 */
export interface BlockResult {
  /** False when the block landed but the reason-report insert failed. */
  reportFiled: boolean
}

export async function blockUserInDb(
  supabase: SupabaseClient,
  blockerId: string,
  targetUserId: string,
  reason?: string
): Promise<BlockResult> {
  const { error } = await supabase.from('blocks').insert({
    blocker_id: blockerId,
    blocked_id: targetUserId,
  })
  // 23505 = already blocked; that is success, not failure.
  if (error && error.code !== '23505') throw error

  const trimmed = reason?.trim()
  if (!trimmed) return { reportFiled: false }

  // reports.reason CHECK requires 10..1000 chars; the prefix guarantees the
  // floor, slice enforces the ceiling.
  const { error: reportError } = await supabase.from('reports').insert({
    reporter_id: blockerId,
    target_id: targetUserId,
    target_type: 'profile',
    reason: `Blocked user: ${trimmed}`.slice(0, 1000),
    details: trimmed.slice(0, 1000),
  })
  if (reportError) {
    // The block (the safety control) stands; the report is auxiliary signal.
    // Visible failure, not a silent one — the caller decides what to tell the user.
    console.error('block landed but reason-report failed:', reportError)
    return { reportFiled: false }
  }
  return { reportFiled: true }
}

export async function unblockUserInDb(
  supabase: SupabaseClient,
  blockerId: string,
  targetUserId: string
): Promise<void> {
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', targetUserId)
  if (error) throw error
}

export async function listBlockedUserIds(
  supabase: SupabaseClient,
  blockerId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', blockerId)
  if (error) throw error
  return (data ?? []).map(row => row.blocked_id as string)
}
