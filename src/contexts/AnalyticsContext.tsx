'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'

import {
  initAnalytics,
  hasAnalyticsConsent,
  analyticsConsentDecided,
  grantAnalyticsConsent,
  withdrawAnalyticsConsent,
  track as trackEvent,
  analyticsConfig,
} from '@/lib/analytics/posthog'
import type { AnalyticsEventName, AnalyticsProperties } from '@/lib/analytics/events'

interface AnalyticsContextType {
  /** Whether analytics is configured (a PostHog key is present). */
  enabled: boolean
  /** True once the user has explicitly opted in. */
  consentGranted: boolean
  /** True once the user has made any choice (hides the banner). */
  consentDecided: boolean
  grantConsent: () => void
  declineConsent: () => void
  /** Capture a funnel event (no-op until consent). */
  track: (event: AnalyticsEventName, properties?: AnalyticsProperties) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const enabled = analyticsConfig() !== null
  const [consentGranted, setConsentGranted] = useState(false)
  const [consentDecided, setConsentDecided] = useState(true) // hide banner until known

  useEffect(() => {
    if (!enabled) return
    initAnalytics()
    setConsentGranted(hasAnalyticsConsent())
    setConsentDecided(analyticsConsentDecided())
  }, [enabled])

  const grantConsent = useCallback(() => {
    grantAnalyticsConsent()
    setConsentGranted(true)
    setConsentDecided(true)
  }, [])

  const declineConsent = useCallback(() => {
    withdrawAnalyticsConsent()
    setConsentGranted(false)
    setConsentDecided(true)
  }, [])

  const track = useCallback((event: AnalyticsEventName, properties?: AnalyticsProperties) => {
    trackEvent(event, properties)
  }, [])

  return (
    <AnalyticsContext.Provider
      value={{
        enabled,
        consentGranted,
        consentDecided,
        grantConsent,
        declineConsent,
        track,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  )
}
