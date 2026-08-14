import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/waitlist
 *
 * Server-side waitlist signup. Uses the anon key + SECURITY DEFINER RPC
 * `join_waitlist` which atomically inserts, resolves referrals, and returns
 * the rank + total. No PII leaks to the client beyond what the visitor
 * submitted.
 *
 * Body: { email: string, firstName?: string, city?: string, ref?: string }
 * Returns: { ok: true, referralCode, rank, total, isNew }
 *          | { ok: false, error: string }
 */

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) throw new Error('Missing Supabase env vars')
  return createClient(url, anonKey)
}

export async function POST(request: NextRequest) {
  let body: { email?: string; firstName?: string; city?: string; ref?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const email = body.email?.trim()
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'Valid email required' }, { status: 422 })
  }

  const supabase = getAnonClient()

  const { data, error } = await supabase.rpc('join_waitlist', {
    p_email: email,
    p_first_name: body.firstName?.trim() || null,
    p_city: body.city?.trim() || null,
    p_referred_by_code: body.ref?.trim() || null,
  })

  if (error || !data || data.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'Unable to join waitlist. Please try again.' },
      { status: 500 }
    )
  }

  const row = data[0]

  return NextResponse.json({
    ok: true,
    referralCode: row.out_referral_code,
    rank: row.out_rank,
    total: row.out_total,
    isNew: row.out_is_new,
  })
}

/**
 * GET /api/waitlist
 *
 * Returns the current signup count for the live counter widget.
 * Uses the SECURITY DEFINER `get_waitlist_count` function.
 */
export async function GET() {
  try {
    const supabase = getAnonClient()
    const { data } = await supabase.rpc('get_waitlist_count')
    return NextResponse.json({ total: data ?? 0 })
  } catch {
    return NextResponse.json({ total: 0 })
  }
}
