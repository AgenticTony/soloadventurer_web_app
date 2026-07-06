import posthog from 'posthog-js'

import { AnalyticsEvents, type AnalyticsEventName, type AnalyticsProperties } from './events'

/**
 * Consent-gated PostHog wrapper for the web acquisition funnel.
 *
 * GDPR: PostHog is initialized with `opt_out_capturing_by_default: true`, so
 * **nothing is captured until the user opts in** via {@link grantAnalyticsConsent}.
 * PostHog persists the opt-in/out decision in its own cookie, which is the source
 * of truth ({@link hasAnalyticsConsent}). Autocapture and automatic pageviews are
 * disabled — the app captures `$pageview` explicitly on route change so nothing
 * fires before consent.
 *
 * The same PostHog project as the mobile app → PostHog stitches the shared
 * `visit → install → meetup_completed` funnel across surfaces.
 */

let initialized = false

/** Read config from env. Analytics is a no-op when the key is unset. */
export function analyticsConfig(): { key: string; host: string } | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return null
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'
  return { key, host }
}

/** Initialize PostHog once (client-side). Safe to call repeatedly. */
export function initAnalytics(): void {
  if (initialized || typeof window === 'undefined') return
  const config = analyticsConfig()
  if (!config) return

  posthog.init(config.key, {
    api_host: config.host,
    // GDPR: collect nothing until the user opts in.
    opt_out_capturing_by_default: true,
    // We capture pageviews explicitly (post-consent); no autocapture noise.
    capture_pageview: false,
    autocapture: false,
    // Never persist PII; property scrub happens at call sites + here.
    sanitize_properties: properties => {
      const scrubbed = { ...properties }
      for (const key of ['email', 'name', 'full_name', 'phone', 'password']) {
        delete scrubbed[key]
      }
      return scrubbed
    },
  })
  initialized = true
}

/** True once the user has explicitly opted in. */
export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined' || !initialized) return false
  return posthog.has_opted_in_capturing()
}

/** True once the user has made a choice either way (banner should not reshow). */
export function analyticsConsentDecided(): boolean {
  if (typeof window === 'undefined' || !initialized) return false
  return posthog.has_opted_in_capturing() || posthog.has_opted_out_capturing()
}

/** Grant consent — opt in to capturing. */
export function grantAnalyticsConsent(): void {
  if (!initialized) return
  posthog.opt_in_capturing()
}

/** Withdraw consent — opt out and clear identity. */
export function withdrawAnalyticsConsent(): void {
  if (!initialized) return
  posthog.opt_out_capturing()
  posthog.reset()
}

/**
 * Capture a funnel event. No-op unless the user has opted in — defense in depth
 * on top of the SDK's own opt-out gate.
 */
export function track(event: AnalyticsEventName, properties?: AnalyticsProperties): void {
  if (!hasAnalyticsConsent()) return
  posthog.capture(event, properties)
}

/** Explicit pageview (funnel entry), post-consent only. */
export function trackPageview(url: string): void {
  if (!hasAnalyticsConsent()) return
  posthog.capture(AnalyticsEvents.pageview, { $current_url: url })
}

/** Reset all module state — test-only. */
export function __resetAnalyticsForTest(): void {
  initialized = false
}
