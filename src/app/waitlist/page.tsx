'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { Check, Globe, Sparkles, Award, Shield, IdCard, Bell, Handshake } from 'lucide-react'
import { useAnalytics } from '@/contexts/AnalyticsContext'
import { AnalyticsEvents } from '@/lib/analytics/events'
import './waitlist.css'

const WAITLIST_CAP = 1000
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.soloadventurer.travel'

const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum'] as const

/** Founding-member tiers: earlier rank = higher tier. */
function tierForRank(rank: number): (typeof TIERS)[number] {
  if (rank > 0 && rank <= 100) return 'Platinum'
  if (rank <= 250) return 'Gold'
  if (rank <= 500) return 'Silver'
  return 'Bronze'
}

interface WaitlistResult {
  ok: boolean
  referralCode?: string
  rank?: number
  total?: number
  isNew?: boolean
  error?: string
}

export default function WaitlistPage() {
  const { track } = useAnalytics()
  const [formState, setFormState] = useState<'default' | 'success' | 'referral'>('default')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [city, setCity] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [bump, setBump] = useState(false)
  const [copied, setCopied] = useState(false)
  const [rank, setRank] = useState(0)
  const [referralCode, setReferralCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const referralSource = useRef<string | null>(null)
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref')
    referralSource.current = ref
    // Funnel event: landed via someone's referral link (no PII — no code value).
    if (ref) track(AnalyticsEvents.referralLanding, { has_ref: true })
  }, [track])

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/waitlist')
        const data = await res.json()
        if (data.total !== undefined) {
          setTotalCount(prev => {
            if (data.total > prev) {
              setBump(true)
              setTimeout(() => setBump(false), 350)
            }
            return data.total
          })
        }
      } catch {
        /* silent */
      }
    }
    fetchCount()
    const id = setInterval(fetchCount, 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const root = scrollRef.current
    if (!root) return
    const targets = root.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    targets.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const joinWaitlist = useCallback(
    async (
      emailVal: string,
      extra?: { firstName?: string; city?: string }
    ): Promise<WaitlistResult> => {
      try {
        const res = await fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailVal,
            firstName: extra?.firstName,
            city: extra?.city,
            ref: referralSource.current,
          }),
        })
        const data = await res.json()
        if (data.ok) {
          setRank(data.rank)
          setReferralCode(data.referralCode)
          setTotalCount(data.total)
        }
        return data
      } catch {
        return { ok: false, error: 'Network error. Please try again.' }
      }
    },
    []
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!email || !/\S+@\S+\.\S+/.test(email)) return
      setSubmitting(true)
      setErrorMsg('')
      const result = await joinWaitlist(email)
      setSubmitting(false)
      if (result.ok) {
        setFormState('success')
        track(AnalyticsEvents.waitlistSignup, { has_ref: Boolean(referralSource.current) })
      } else {
        setErrorMsg(result.error || 'Something went wrong.')
      }
    },
    [email, joinWaitlist, track]
  )

  const handleEnrichment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setSubmitting(true)
      setErrorMsg('')
      const result = await joinWaitlist(email, { firstName, city })
      setSubmitting(false)
      if (result.ok) setFormState('referral')
      else setErrorMsg(result.error || 'Something went wrong.')
    },
    [email, firstName, city, joinWaitlist]
  )

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(`${SITE_URL}/r/${referralCode}`).then(() => {
      setCopied(true)
      track(AnalyticsEvents.shareClick, { channel: 'copy' })
      setTimeout(() => setCopied(false), 2000)
    })
  }, [referralCode, track])

  const referralLink = `${SITE_URL}/r/${referralCode}`

  return (
    <div className="wl" ref={scrollRef}>
      {/* ── Topbar ── */}
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">S</div>
          SoloAdventurer
        </div>
        <nav className="top-links">
          <a href="#perks">Perks</a>
          <a href="#flow">How it works</a>
          <a href="#safety">Safety</a>
          <a href="#next">What&rsquo;s next</a>
          <a href="#founder">Founder</a>
        </nav>
        <button className="top-cta" onClick={() => document.getElementById('hero-form')?.focus()}>
          Join waitlist
        </button>
      </div>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-text">
          <div className="hero-eyebrow">
            <span /> Private beta
          </div>

          <h1 className="display">
            Travel solo. Never <em>alone.</em>
          </h1>

          <p className="hero-sub">
            Meet solo travelers in your city right now. No message lands until you both accept the
            connection. ID-verified badges show who&apos;s been checked.
          </p>

          <div
            className={`form-card ${formState === 'success' ? 'state-success' : formState === 'referral' ? 'state-referral' : ''}`}
          >
            {/* Default */}
            <div className="form-default">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="field">
                    <input
                      id="hero-form"
                      type="email"
                      placeholder="you@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="cta-btn" disabled={submitting}>
                    {submitting ? 'Joining...' : 'Save my spot'}{' '}
                    <span className="arrow">&rarr;</span>
                  </button>
                </div>
              </form>
              <div className="form-meta">
                <span className="live-count">
                  <b className={bump ? 'bump' : ''}>{totalCount}</b> joined
                </span>
                <span>
                  No spam, ever · By joining you agree to our <a href="/privacy">Privacy Policy</a>
                </span>
              </div>
              {errorMsg && (
                <div
                  style={{
                    color: 'var(--wl-ink-mute)',
                    fontSize: 13,
                    marginTop: 8,
                    padding: '0 10px',
                  }}
                >
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Success */}
            <div className="form-success">
              <h4>You&apos;re in. Welcome aboard.</h4>
              <p>Help us personalize your experience (optional):</p>
              <form onSubmit={handleEnrichment}>
                <div className="extra-field">
                  <input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                  />
                  <select value={city} onChange={e => setCity(e.target.value)}>
                    <option value="">Your city</option>
                    <option value="nyc">New York</option>
                    <option value="lon">London</option>
                    <option value="tyo">Tokyo</option>
                    <option value="bcn">Barcelona</option>
                    <option value="bkk">Bangkok</option>
                    <option value="lis">Lisbon</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <button type="submit" className="secondary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Lock it in'}
                </button>
              </form>
            </div>

            {/* Referral */}
            <div className="form-referral">
              <div className="rank">
                <div className="you">Your rank</div>
                <div className="num">
                  <span className="hash">#</span>
                  {rank}
                </div>
                <div className="of">out of {WAITLIST_CAP} spots</div>
              </div>
              <div className="progress-bar">
                <span style={{ width: `${Math.min((rank / WAITLIST_CAP) * 100, 100)}%` }} />
              </div>
              <div className="tier">
                {TIERS.map(t => (
                  <span key={t} className={tierForRank(rank) === t ? 'on' : ''}>
                    {t}
                  </span>
                ))}
              </div>
              <div className="share-label">Share your referral link</div>
              <div className="share-link">
                <input type="text" readOnly value={referralLink} />
                <button onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</button>
              </div>
              <div className="share-socials">
                <button
                  onClick={() => {
                    track(AnalyticsEvents.shareClick, { channel: 'twitter' })
                    window.open(
                      'https://twitter.com/intent/tweet?url=' + encodeURIComponent(referralLink),
                      '_blank'
                    )
                  }}
                >
                  Twitter
                </button>
                <button
                  onClick={() => {
                    track(AnalyticsEvents.shareClick, { channel: 'whatsapp' })
                    window.open(
                      'https://wa.me/?text=' +
                        encodeURIComponent('Join me on SoloAdventurer! ' + referralLink),
                      '_blank'
                    )
                  }}
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => {
                    track(AnalyticsEvents.shareClick, { channel: 'email' })
                    window.open(
                      'mailto:?subject=SoloAdventurer&body=' +
                        encodeURIComponent('Join me! ' + referralLink),
                      '_blank'
                    )
                  }}
                >
                  Email
                </button>
              </div>
            </div>
          </div>

          <div className="hero-trust">
            <span>
              <Check size={16} /> Free to join
            </span>
            <span>
              <Check size={16} /> No credit card
            </span>
            <span>
              <Check size={16} /> Mutual opt-in messaging
            </span>
          </div>
        </div>

        {/* Hero image */}
        <div className="hero-image">
          <Image
            src="/waitlist-hero.jpg"
            alt="Two travelers meeting at a rooftop cafe in Lisbon at golden hour"
            fill
            priority
            sizes="50vw"
          />
          <div className="hero-quote">
            <p>Join the first 1,000.</p>
            <cite>Founding members get priority access at launch.</cite>
          </div>
        </div>
      </section>

      {/* ── Perks ── */}
      <section className="perks" id="perks">
        <div className="perks-inner">
          <div className="perks-head" data-reveal>
            <h2>Early members get more.</h2>
          </div>
          <div className="perks-grid" data-reveal>
            <div className="perk">
              <div className="perk-icon">
                <Globe size={22} strokeWidth={1.5} />
              </div>
              <h3>Global community</h3>
              <p>Connect with solo travelers in cities worldwide before you even land.</p>
            </div>
            <div className="perk">
              <div className="perk-icon">
                <Sparkles size={22} strokeWidth={1.5} />
              </div>
              <h3>Priority matching</h3>
              <p>Early members get first access to our AI-powered traveler matching.</p>
            </div>
            <div className="perk">
              <div className="perk-icon">
                <Award size={22} strokeWidth={1.5} />
              </div>
              <h3>Founding member status</h3>
              <p>
                Priority access at launch, a direct line to the founder, and invite-only early
                events in our first cities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="flow" id="flow">
        <div className="flow-inner">
          <div className="flow-head" data-reveal>
            <h2>From landing to dinner in three steps.</h2>
          </div>
          <div className="flow-steps">
            <div className="flow-step" data-reveal>
              <div className="flow-step-num">i</div>
              <h4>Share your trip</h4>
              <p>
                Enter your destination and travel dates. We find travelers on the same path, same
                week.
              </p>
            </div>
            <div className="flow-step" data-reveal>
              <div className="flow-step-num">ii</div>
              <h4>Browse your matches</h4>
              <p>
                See travelers heading to the same city. Badges show who completed a real selfie + ID
                verification.
              </p>
            </div>
            <div className="flow-step" data-reveal>
              <div className="flow-step-num">iii</div>
              <h4>Meet up for real</h4>
              <p>
                Suggest a time and place. Confirm with one tap. No endless group chats, just a real
                meetup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Audience ── */}
      <section className="audience">
        <div className="audience-inner">
          <div data-reveal>
            <h2>
              Built for people who pack light and want someone to grab dinner with in a city where
              they know <em>no one.</em>
            </h2>
          </div>
          <div data-reveal>
            <div className="audience-tags">
              <span className="audience-tag">Solo backpackers</span>
              <span className="audience-tag">Digital nomads</span>
              <span className="audience-tag">Career-break travelers</span>
              <span className="audience-tag">Extroverted introverts</span>
              <span className="audience-tag">Hostel hoppers</span>
              <span className="audience-tag not-for">Group tour seekers</span>
              <span className="audience-tag not-for">Cruise package buyers</span>
              <span className="audience-tag not-for">All-inclusive resort fans</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Safety ── */}
      <section className="safety" id="safety">
        <div className="safety-inner">
          <div className="safety-head" data-reveal>
            <h2>Safety is the product, not a feature page.</h2>
          </div>
          <div className="safety-grid" data-reveal>
            <div className="safety-item">
              <Handshake size={28} strokeWidth={1.5} />
              <h4>Mutual opt-in</h4>
              <p>
                Connection requests need both sides to accept. No message lands unless you say yes.
              </p>
            </div>
            <div className="safety-item">
              <IdCard size={28} strokeWidth={1.5} />
              <h4>ID verification (Pro)</h4>
              <p>
                Government ID check with a verified badge on your profile, so others know
                you&apos;ve been checked.
              </p>
            </div>
            <div className="safety-item">
              <Bell size={28} strokeWidth={1.5} />
              <h4>Meetup check-ins</h4>
              <p>Automated safety check-ins during meetups with one-tap confirmation.</p>
            </div>
            <div className="safety-item">
              <Shield size={28} strokeWidth={1.5} />
              <h4>Report and block</h4>
              <p>
                Block instantly, report in two taps. Women-only spaces and ID verification built in
                from day one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Founder ── */}
      <section className="founder" id="founder">
        <div className="founder-inner" data-reveal>
          <blockquote>
            &ldquo;I spent two years traveling solo across 30 countries. The best moments were never
            the sights. They were the people I met along the way. I built SoloAdventurer so you
            don&apos;t have to rely on luck to find your people.&rdquo;
          </blockquote>
          <div className="founder-attr">
            <span className="name">Anthony Foran</span>
            <span className="divider" />
            <span className="role">Founder, SoloAdventurer</span>
          </div>
        </div>
      </section>

      {/* ── What happens next ── */}
      <section className="next" id="next">
        <div className="next-inner">
          <div className="next-head" data-reveal>
            <h2>
              You&rsquo;re joining an app, <em>not a mailing list.</em>
            </h2>
          </div>
          <div className="next-steps">
            <div className="next-step" data-reveal>
              <div className="next-step-num">01</div>
              <h4>A mobile app, built for solo travel</h4>
              <p>
                SoloAdventurer is a free mobile app for iOS and Android, now in private beta. The
                waitlist secures your place in line.
              </p>
            </div>
            <div className="next-step" data-reveal>
              <div className="next-step-num">02</div>
              <h4>Invites go out in waves</h4>
              <p>
                Founding members get access first, starting with travelers in New York, London,
                Tokyo, Barcelona, Bangkok, and Lisbon.
              </p>
            </div>
            <div className="next-step" data-reveal>
              <div className="next-step-num">03</div>
              <h4>Your rank moves you up</h4>
              <p>
                Every friend who joins through your referral link bumps you up the list. Top of the
                list, first through the door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="final-cta">
        <h2>
          Don&apos;t travel solo, <em>travel connected.</em>
        </h2>
        <form
          className="final-form"
          onSubmit={async e => {
            e.preventDefault()
            const input = (e.target as HTMLFormElement).querySelector('input')
            if (input?.value && /\S+@\S+\.\S+/.test(input.value)) {
              setEmail(input.value)
              setSubmitting(true)
              const result = await joinWaitlist(input.value)
              setSubmitting(false)
              if (result.ok) {
                setFormState('success')
                track(AnalyticsEvents.waitlistSignup, { has_ref: Boolean(referralSource.current) })
              }
            }
          }}
        >
          <input type="email" placeholder="Enter your email" />
          <button type="submit" disabled={submitting}>
            {submitting ? 'Joining...' : 'Join now'} <span>&rarr;</span>
          </button>
        </form>
        <div className="final-note">Free to join. ID verification available in Pro.</div>
      </section>

      {/* ── Footer ── */}
      <footer>
        <span>&copy; {new Date().getFullYear()} SoloAdventurer</span>
        <div>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="mailto:hello@soloadventurer.travel">hello@soloadventurer.travel</a>
        </div>
      </footer>
    </div>
  )
}
