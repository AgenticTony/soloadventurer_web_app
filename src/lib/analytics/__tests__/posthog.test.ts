/**
 * Story 0.1 (web) — consent-gated PostHog wrapper.
 * Verifies GDPR opt-in: nothing captured until consent; correct init options.
 */

jest.mock('posthog-js', () => {
  let optedIn = false
  let optedOut = false
  return {
    __esModule: true,
    default: {
      init: jest.fn(),
      capture: jest.fn(),
      reset: jest.fn(),
      opt_in_capturing: jest.fn(() => {
        optedIn = true
        optedOut = false
      }),
      opt_out_capturing: jest.fn(() => {
        optedOut = true
        optedIn = false
      }),
      has_opted_in_capturing: jest.fn(() => optedIn),
      has_opted_out_capturing: jest.fn(() => optedOut),
      __reset: () => {
        optedIn = false
        optedOut = false
      },
    },
  }
})

import posthog from 'posthog-js'
import { AnalyticsEvents } from '../events'
import {
  analyticsConfig,
  initAnalytics,
  hasAnalyticsConsent,
  analyticsConsentDecided,
  grantAnalyticsConsent,
  withdrawAnalyticsConsent,
  track,
  trackPageview,
  __resetAnalyticsForTest,
} from '../posthog'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ph = posthog as any

beforeEach(() => {
  jest.clearAllMocks()
  ph.__reset()
  __resetAnalyticsForTest()
  process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test'
  process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://eu.i.posthog.com'
})

describe('Story 0.1 — web analytics consent gate', () => {
  it('is a no-op when no key is configured', () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY
    expect(analyticsConfig()).toBeNull()
    initAnalytics()
    expect(ph.init).not.toHaveBeenCalled()
  })

  it('initializes opted-out with the EU host (GDPR)', () => {
    initAnalytics()
    expect(ph.init).toHaveBeenCalledTimes(1)
    const [key, opts] = ph.init.mock.calls[0]
    expect(key).toBe('phc_test')
    expect(opts.api_host).toBe('https://eu.i.posthog.com')
    expect(opts.opt_out_capturing_by_default).toBe(true)
    expect(opts.capture_pageview).toBe(false)
  })

  it('captures nothing before consent', () => {
    initAnalytics()
    expect(hasAnalyticsConsent()).toBe(false)
    expect(analyticsConsentDecided()).toBe(false)

    track(AnalyticsEvents.installClick, { source: 'hero' })
    trackPageview('/')
    expect(ph.capture).not.toHaveBeenCalled()
  })

  it('captures funnel events once consent is granted', () => {
    initAnalytics()
    grantAnalyticsConsent()

    expect(ph.opt_in_capturing).toHaveBeenCalled()
    expect(hasAnalyticsConsent()).toBe(true)
    expect(analyticsConsentDecided()).toBe(true)

    track(AnalyticsEvents.installClick, { source: 'hero' })
    expect(ph.capture).toHaveBeenCalledWith('install_click', { source: 'hero' })

    trackPageview('/discover?ref=x')
    expect(ph.capture).toHaveBeenCalledWith(AnalyticsEvents.pageview, {
      $current_url: '/discover?ref=x',
    })
  })

  it('withdrawal opts out, resets identity, and re-blocks events', () => {
    initAnalytics()
    grantAnalyticsConsent()
    withdrawAnalyticsConsent()

    expect(ph.opt_out_capturing).toHaveBeenCalled()
    expect(ph.reset).toHaveBeenCalled()
    expect(analyticsConsentDecided()).toBe(true) // a decision was made
    expect(hasAnalyticsConsent()).toBe(false)

    ph.capture.mockClear()
    track(AnalyticsEvents.shareClick)
    expect(ph.capture).not.toHaveBeenCalled()
  })

  it('event taxonomy exposes the funnel legs', () => {
    expect(AnalyticsEvents.pageview).toBe('$pageview')
    expect(AnalyticsEvents.installClick).toBe('install_click')
    expect(AnalyticsEvents.shareClick).toBe('share_click')
    expect(AnalyticsEvents.referralLanding).toBe('referral_landing')
  })
})
