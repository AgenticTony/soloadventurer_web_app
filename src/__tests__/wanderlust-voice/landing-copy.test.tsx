/**
 * Landing page copy — charter conformance (Story W.3).
 *
 * The landing page is the acquisition surface, so it is where off-charter
 * framing does the most damage: it sets the expectation every later screen has
 * to live up to. Before this story it sold "find your perfect travel companion"
 * through "our intelligent matching system" — the matching-app product that
 * FOUNDATIONS §1 explicitly supersedes — and never mentioned verification, which
 * is the thing that actually differentiates it.
 *
 * These tests are a ratchet, not decoration. Copy drifts back toward whatever is
 * easiest to write, and "find your match" is much easier to write than the real
 * proposition.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

/**
 * Framing FOUNDATIONS rules out.
 *
 * `match` is checked as a whole word so it cannot be smuggled in as a noun, but
 * "matched with verified women" stays legal — matching as a *mechanism* is fine;
 * matching as the *product* is not.
 */
const OFF_CHARTER = [
  /\bcompanion(s)?\b/i,
  /\bmatching system\b/i,
  /\bperfect match\b/i,
  /\bfind your match\b/i,
  /\btravel buddy\b/i,
  /\bswipe\b/i,
]

/** Claims we cannot substantiate. */
const UNSUBSTANTIATED = [/\bthousands\b/i, /\bmillions\b/i, /\bjoin \d/i]

function pageText(): string {
  const { container } = render(<HomePage />)
  return container.textContent ?? ''
}

describe('landing page — charter conformance', () => {
  it('leads with verification, not matching', () => {
    const text = pageText()
    expect(text).toMatch(/verified|ID-checked|verification/i)
  })

  it('names the city-now proposition rather than a global directory', () => {
    expect(pageText()).toMatch(/city you(&apos;|')?re in|right now|actually here/i)
  })

  it('ties reputation to meetups that happened, not to content', () => {
    const text = pageText()
    expect(text).toMatch(/meetup|show up|reputation/i)
    // Reputation must not be framed as a social/content metric (FOUNDATIONS §6.1).
    expect(text).not.toMatch(/\bfollowers\b(?!,)/i)
  })

  it('surfaces women-only mode — core strategy, not a niche toggle', () => {
    expect(pageText()).toMatch(/women/i)
  })

  it.each(OFF_CHARTER)('does not use off-charter framing: %s', pattern => {
    expect(pageText()).not.toMatch(pattern)
  })

  it.each(UNSUBSTANTIATED)('makes no unsubstantiated scale claim: %s', pattern => {
    expect(pageText()).not.toMatch(pattern)
  })

  it('keeps both entry points reachable', () => {
    render(<HomePage />)
    expect(screen.getByRole('link', { name: /get verified/i })).toHaveAttribute('href', '/signup')
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/sign-in')
  })
})
