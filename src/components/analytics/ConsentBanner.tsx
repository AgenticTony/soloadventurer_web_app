'use client'

import { useAnalytics } from '@/contexts/AnalyticsContext'

/**
 * GDPR analytics consent banner (opt-in). Shows only when analytics is
 * configured and the user has not yet made a choice. Accepting opts in;
 * declining opts out. Nothing is captured until "Accept".
 */
export function ConsentBanner() {
  const { enabled, consentDecided, grantConsent, declineConsent } = useAnalytics()

  if (!enabled || consentDecided) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Analytics consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-4 shadow-lg backdrop-blur"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use privacy-friendly analytics (EU-hosted) to understand how people discover
          SoloAdventurer. No tracking happens until you agree, and we never collect personal details
          in analytics.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={declineConsent}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={grantConsent}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
