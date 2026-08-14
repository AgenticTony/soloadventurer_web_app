import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import WaitlistPage from '@/app/waitlist/page'
import PrivacyPage from '@/app/privacy/page'
import TermsPage from '@/app/terms/page'

/**
 * Waitlist copy guards — marketing-readiness contract.
 *
 * These tests pin two things:
 *  1. REQUIRED elements: legal links that must resolve (they are ad-platform
 *     and GDPR prerequisites), the mobile-app clarity block, and the honest
 *     founding-member framing.
 *  2. FORBIDDEN claims: copy that overstates what the product can do today
 *     (fake social proof, nonexistent trust team, nonexistent partner
 *     discounts). FOUNDATIONS §6.10 bans unbacked social proof; the product
 *     is a trust platform, so the bar is higher than usual.
 *
 * Also guards the consent-gated analytics wiring (waitlist_signup /
 * referral_landing / share_click events from src/lib/analytics/events.ts).
 */

jest.mock('@/contexts/AnalyticsContext', () => {
  const track = jest.fn()
  const mod = {
    useAnalytics: () => ({
      enabled: true,
      consentGranted: true,
      consentDecided: true,
      grantConsent: jest.fn(),
      declineConsent: jest.fn(),
      track,
    }),
    __trackMock: track,
  }
  return mod
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const trackMock = (jest.requireMock('@/contexts/AnalyticsContext') as any).__trackMock as jest.Mock

function mockFetch(handlers: { GET?: object; POST?: object } = {}) {
  const impl = (_url: unknown, init?: RequestInit) =>
    Promise.resolve({
      json: async () =>
        init?.method === 'POST' ? (handlers.POST ?? { ok: false }) : (handlers.GET ?? { total: 0 }),
    })
  ;(global.fetch as jest.Mock).mockImplementation(impl)
}

describe('Waitlist — required elements', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.history.pushState({}, '', '/waitlist')
    mockFetch({
      GET: { total: 12 },
      POST: { ok: true, referralCode: 'TESTCODE', rank: 5, total: 13, isNew: true },
    })
  })

  it('renders the hero headline', () => {
    render(<WaitlistPage />)
    expect(screen.getByText(/travel solo\. never/i)).toBeInTheDocument()
  })

  it('footer links to live /privacy and /terms routes', () => {
    render(<WaitlistPage />)
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms')
  })

  it('links the privacy policy from under the signup form', () => {
    render(<WaitlistPage />)
    const links = screen.getAllByRole('link', { name: /privacy policy/i })
    expect(links.length).toBeGreaterThan(0)
    expect(links[0]).toHaveAttribute('href', '/privacy')
  })

  it('tells visitors it is a mobile app for iOS and Android', () => {
    render(<WaitlistPage />)
    expect(screen.getByText(/iOS and Android/i)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /mobile app, built for solo travel/i })
    ).toBeInTheDocument()
  })

  it('explains how early access works (waves, first cities, rank)', () => {
    render(<WaitlistPage />)
    expect(screen.getByText(/Invites go out in waves/i)).toBeInTheDocument()
    expect(screen.getByText(/Your rank moves you up/i)).toBeInTheDocument()
  })

  it('uses honest founding-member framing instead of testimonials', () => {
    render(<WaitlistPage />)
    expect(screen.getByText('Join the first 1,000.')).toBeInTheDocument()
    expect(screen.getByText('Founding member status')).toBeInTheDocument()
  })
})

describe('Waitlist — forbidden claims (honesty guards)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.history.pushState({}, '', '/waitlist')
    mockFetch({ GET: { total: 12 } })
  })

  it('contains no fabricated testimonial', () => {
    const { container } = render(<WaitlistPage />)
    expect(container.textContent).not.toMatch(/Sarah/)
    expect(container.textContent).not.toMatch(/I met three amazing people/)
  })

  it('does not claim a trust team monitors around the clock', () => {
    const { container } = render(<WaitlistPage />)
    expect(container.textContent).not.toMatch(/trust team/i)
  })

  it('does not promise partner discounts that do not exist', () => {
    const { container } = render(<WaitlistPage />)
    expect(container.textContent).not.toMatch(/partner discounts/i)
  })

  it('does not claim every profile is identity-checked (verification is optional)', () => {
    const { container } = render(<WaitlistPage />)
    expect(container.textContent).not.toMatch(/every profile is identity-checked/i)
  })
})

describe('Waitlist — analytics wiring', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch({
      GET: { total: 12 },
      POST: { ok: true, referralCode: 'TESTCODE', rank: 5, total: 13, isNew: true },
    })
  })

  it('fires waitlist_signup on successful join (no PII in properties)', async () => {
    window.history.pushState({}, '', '/waitlist')
    render(<WaitlistPage />)
    fireEvent.change(screen.getByPlaceholderText('you@email.com'), {
      target: { value: 'traveler@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save my spot/i }))
    await waitFor(() => {
      expect(trackMock).toHaveBeenCalledWith('waitlist_signup', { has_ref: false })
    })
    // Never the email itself.
    expect(trackMock).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('traveler@example.com')
    )
  })

  it('fires referral_landing when arriving with ?ref=', async () => {
    window.history.pushState({}, '', '/waitlist?ref=ABC123XY')
    render(<WaitlistPage />)
    await waitFor(() => {
      expect(trackMock).toHaveBeenCalledWith('referral_landing', { has_ref: true })
    })
  })

  it('marks waitlist_signup as referred when joining via a referral link', async () => {
    window.history.pushState({}, '', '/waitlist?ref=ABC123XY')
    render(<WaitlistPage />)
    await waitFor(() => {
      expect(trackMock).toHaveBeenCalledWith('referral_landing', { has_ref: true })
    })
    fireEvent.change(screen.getByPlaceholderText('you@email.com'), {
      target: { value: 'friend@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save my spot/i }))
    await waitFor(() => {
      expect(trackMock).toHaveBeenCalledWith('waitlist_signup', { has_ref: true })
    })
  })
})

describe('Legal pages render', () => {
  it('privacy page states the opt-in analytics model and 18+ rule', () => {
    render(<PrivacyPage />)
    expect(screen.getByRole('heading', { name: /privacy policy/i })).toBeInTheDocument()
    expect(screen.getByText(/opt-in only/i)).toBeInTheDocument()
    expect(screen.getByText(/18/)).toBeInTheDocument()
  })

  it('terms page frames the waitlist as an early-access reservation', () => {
    render(<TermsPage />)
    expect(screen.getByRole('heading', { name: /terms of service/i })).toBeInTheDocument()
    expect(screen.getByText(/reservation/i)).toBeInTheDocument()
    expect(screen.getByText(/iOS and Android/i)).toBeInTheDocument()
  })
})
