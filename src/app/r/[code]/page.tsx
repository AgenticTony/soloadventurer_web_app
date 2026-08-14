import { redirect } from 'next/navigation'

/**
 * Referral link handler: /r/{code} -> /waitlist?ref={code}
 *
 * The waitlist page generates share links of the form
 * `https://www.soloadventurer.travel/r/{referralCode}`. This route bounces the
 * visitor to the waitlist with the code as a query param, which the page
 * reads on mount and sends to `join_waitlist` so the referral is credited.
 */
export default async function ReferralRedirect({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  // Sanitize: referral codes are alphanumeric, 8 chars. Strip anything else.
  const clean = code.replace(/[^A-Za-z0-9]/g, '').slice(0, 16)
  redirect(`/waitlist?ref=${clean}`)
}
