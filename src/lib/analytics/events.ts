/**
 * Web acquisition-funnel event taxonomy (Phase 0 / Story 0.1).
 *
 * These are the TOP-of-funnel legs the web (acquisition surface) owns. The
 * north-star — `meetup_completed` — is emitted by the app/backend from
 * `meetup_outcomes` (see the mobile repo's docs/analytics-v0.1.md). Because web
 * and app report into the SAME PostHog project, PostHog stitches the full
 * `visit → install → meetup_completed` funnel.
 *
 * Guardrail (FOUNDATIONS §6): no engagement proxy is a north-star. These are
 * acquisition/diagnostic events; the north-star is a real-world outcome.
 */
export const AnalyticsEvents = {
  /** A page view (funnel entry). Emitted as PostHog's `$pageview`. */
  pageview: '$pageview',
  /** Anonymous visitor clicked an app-store / install CTA. */
  installClick: 'install_click',
  /** Visitor shared a public page (share → install loop). */
  shareClick: 'share_click',
  /** Landing hit via a referral/share link (carries a ref code, no PII). */
  referralLanding: 'referral_landing',
  /** Waitlist / notify-me signup (pre-install activation on web). */
  waitlistSignup: 'waitlist_signup',
} as const

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents]

/** Property maps are plain JSON; never include PII (email/name/phone). */
export type AnalyticsProperties = Record<string, string | number | boolean | null>
