'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import { trackPageview } from '@/lib/analytics/posthog'

/**
 * Captures a `$pageview` (funnel entry) on every route change — the top of the
 * acquisition funnel. No-op until the user opts in (the tracker calls through the
 * consent-gated client). Rendered inside the `AnalyticsProvider`.
 */
export function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return
    const query = searchParams?.toString()
    const url = query ? `${pathname}?${query}` : pathname
    trackPageview(url)
  }, [pathname, searchParams])

  return null
}
