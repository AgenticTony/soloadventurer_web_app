'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import './waitlist.css'

/* ── Headline presets ── */
const HEADLINES: Record<string, { html: string; sub: string }> = {
  'your-people': {
    html: 'Your people are\nalready <em>there.</em>',
    sub: 'Join verified solo travelers heading to the same cities, the same week. No algorithms, no creeps — just real people who travel like you.',
  },
  'never-alone': {
    html: 'Travel solo.\nNever <em>alone.</em>',
    sub: 'Meet fellow travelers in your city with shared itineraries and verified profiles. Your next adventure starts with a hello.',
  },
  'new-social': {
    html: 'Solo is the\nnew <em>social.</em>',
    sub: 'A private community of verified solo travelers. No groups to join, no guides to book — just people like you, in the same place.',
  },
  'found-you': {
    html: 'We found your\ntravel <em>people.</em>',
    sub: 'Same city, same week, same vibe. SoloAdventurer matches you with verified travelers so you never explore alone.',
  },
}

const CTA_OPTIONS: Record<string, string> = {
  default: 'Save my spot',
  urgent: 'Claim your spot',
  exclusive: 'Get early access',
}

type FormState = 'default' | 'success' | 'referral'

export default function WaitlistPage() {
  /* ── State ── */
  const [formState, setFormState] = useState<FormState>('default')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [city, setCity] = useState('')
  const [counter, setCounter] = useState(47)
  const [scarcityLeft, setScarcityLeft] = useState(631)
  const [bump, setBump] = useState(false)
  const [copied, setCopied] = useState(false)
  const [rank, setRank] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [tweaksOpen, setTweaksOpen] = useState(false)
  const [tweaks, setTweaks] = useState({
    headline: 'your-people',
    cta: 'default',
    heroLayout: 'split',
    theme: 'warm',
    founder: true,
  })

  const scrollRef = useRef<HTMLDivElement>(null)

  /* ── Client-only mount flag ── */
  useEffect(() => {
    setMounted(true)
    setRank(Math.floor(Math.random() * 400) + 100)
  }, [])

  /* ── Live counter ── */
  useEffect(() => {
    const id = setInterval(
      () => {
        setCounter(c => c + 1)
        setBump(true)
        setTimeout(() => setBump(false), 350)
      },
      4200 + Math.random() * 2000
    )
    return () => clearInterval(id)
  }, [])

  /* ── Scarcity counter ── */
  useEffect(() => {
    const id = setInterval(
      () => {
        setScarcityLeft(c => Math.max(c - 1, 400))
      },
      15000 + Math.random() * 10000
    )
    return () => clearInterval(id)
  }, [])

  /* ── Theme ── */
  useEffect(() => {
    document.body.setAttribute('data-theme', tweaks.theme)
    return () => {
      document.body.removeAttribute('data-theme')
    }
  }, [tweaks.theme])

  /* ── Scroll reveal ── */
  useEffect(() => {
    const root = scrollRef.current
    if (!root) return
    const targets = root.querySelectorAll('.unlock-item, .step, .safety-item, .founder-grid > *')
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).style.opacity = '1'
            ;(entry.target as HTMLElement).style.transform = 'translateY(0)'
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    targets.forEach(el => {
      const htmlEl = el as HTMLElement
      htmlEl.style.opacity = '0'
      htmlEl.style.transform = 'translateY(24px)'
      htmlEl.style.transition = 'opacity .6s ease, transform .6s ease'
      observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  /* ── Form handlers ── */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!email || !/\S+@\S+\.\S+/.test(email)) return
      setFormState('success')
    },
    [email]
  )

  const handleEnrichment = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setFormState('referral')
  }, [])

  const handleCopy = useCallback(() => {
    const link = `https://soloadventurer.com/r/${Math.random().toString(36).slice(2, 8)}`
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  const currentHeadline = HEADLINES[tweaks.headline]
  const currentCta = CTA_OPTIONS[tweaks.cta]

  /* ── Referral link ── */
  const referralLink = `https://soloadventurer.com/r/abc${rank}`

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
          <a href="#how">How it works</a>
          <a href="#who">Who it&apos;s for</a>
          <a href="#safety">Safety</a>
          <a href="#founder">Founder</a>
        </nav>
        <button className="top-cta" onClick={() => document.getElementById('hero-form')?.focus()}>
          Join waitlist
        </button>
      </div>

      {/* ── Hero ── */}
      <header className="hero">
        <div className="hero-grid">
          {/* Left */}
          <div className="hero-text-block">
            <span className="eyebrow">
              <span className="dot" />
              Private beta &middot; launching summer 2026
            </span>

            <h1
              className="display"
              dangerouslySetInnerHTML={{
                __html: currentHeadline.html.replace(/\n/g, '<br />'),
              }}
            />

            <p className="sub">{currentHeadline.sub}</p>

            {/* ── Form card ── */}
            <div
              className={`form-card${
                formState === 'success'
                  ? 'state-success'
                  : formState === 'referral'
                    ? 'state-referral'
                    : ''
              }`}
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
                    <button type="submit" className="cta">
                      {currentCta} <span className="arrow">&rarr;</span>
                    </button>
                  </div>
                </form>
                <div className="form-meta">
                  <span className="counter">
                    <span className="pulse" />
                    <b className={bump ? 'bump' : ''}>{counter}</b> joined today
                  </span>
                  <span>No spam, ever</span>
                </div>
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
                      <option value="syd">Sydney</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <button type="submit" className="secondary">
                    Lock it in
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
                  <div className="of">out of 1,000 spots</div>
                </div>
                <div className="progress-bar">
                  <span style={{ width: `${(rank / 1000) * 100}%` }} />
                </div>
                <div className="tier">
                  <span>Bronze</span>
                  <span className="on">Silver</span>
                  <span>Gold</span>
                  <span>Platinum</span>
                </div>
                <div className="share-label">Share your referral link</div>
                <div className="share-link">
                  <input type="text" readOnly value={referralLink} />
                  <button onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</button>
                </div>
                <div className="share-socials">
                  <button
                    onClick={() =>
                      window.open(
                        'https://twitter.com/intent/tweet?url=' + encodeURIComponent(referralLink),
                        '_blank'
                      )
                    }
                  >
                    Twitter
                  </button>
                  <button
                    onClick={() =>
                      window.open(
                        'https://wa.me/?text=' +
                          encodeURIComponent('Join me on SoloAdventurer! ' + referralLink),
                        '_blank'
                      )
                    }
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() =>
                      window.open(
                        'mailto:?subject=SoloAdventurer&body=' +
                          encodeURIComponent('Join me! ' + referralLink),
                        '_blank'
                      )
                    }
                  >
                    Email
                  </button>
                </div>
              </div>
            </div>

            <div className="hero-asides">
              <span>
                <span className="tick">&#10003;</span>Free to join
              </span>
              <span>
                <span className="tick">&#10003;</span>No credit card
              </span>
              <span>
                <span className="tick">&#10003;</span>Cancel anytime
              </span>
            </div>
          </div>

          {/* Right — hero media */}
          <aside className="hero-media">
            <div className="placeholder-tag">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2BA86A' }} />
              Live preview
            </div>

            {/* Ticket card */}
            <div className="ticket">
              <div className="row">
                <span className="route">NYC &rarr; TYO</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--wl-ink-mute)' }}>
                  Jul 12
                </span>
              </div>
              <div className="meta">3 travelers matched</div>
              <hr />
              <div className="avatars">
                <div className="stack">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="mono" style={{ fontSize: 11, color: 'var(--wl-ink-mute)' }}>
                  +2 nearby
                </span>
              </div>
            </div>

            <div className="media-caption">
              <span className="q">&ldquo;I met three amazing people in my first week.&rdquo;</span>
              <span className="who">
                Sarah, 28
                <br />
                Barcelona &rarr; Lisbon
              </span>
            </div>
          </aside>
        </div>
      </header>

      {/* ── Unlock / Perks ── */}
      <section className="unlock" id="perks">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">01 / Waitlist perks</span>
              <h2>Unlock early, travel further</h2>
            </div>
          </div>
          <div className="unlock-grid">
            <div className="unlock-item">
              <div className="unlock-glyph">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <span className="unlock-num">01</span>
              <h3>Global community</h3>
              <p>
                Connect with verified solo travelers in 120+ cities worldwide before you even land.
              </p>
            </div>
            <div className="unlock-item">
              <div className="unlock-glyph">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <span className="unlock-num">02</span>
              <h3>Priority matching</h3>
              <p>Early members get first access to our AI-powered traveler matching algorithm.</p>
            </div>
            <div className="unlock-item">
              <div className="unlock-glyph">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M20 12v10H4V12" />
                  <path d="M2 7h20v5H2z" />
                  <path d="M12 22V7" />
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
              </div>
              <span className="unlock-num">03</span>
              <h3>Exclusive perks</h3>
              <p>
                Partner discounts on flights, hostels, experiences, and travel insurance — just for
                members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="how" id="how">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">02 / How it works</span>
              <h2>Three steps to your next adventure</h2>
            </div>
          </div>
          <div className="steps">
            {/* Step 01 */}
            <div className="step">
              <div className="step-header">
                <span className="step-num">STEP 01</span>
                <div className="step-dots">
                  <span className="on" />
                  <span />
                  <span />
                </div>
              </div>
              <div className="mini">
                <span className="mini-label">Destination</span>
                <div className="mini-input active">
                  <span className="ic" />
                  Tokyo, Japan
                  <span className="caret" />
                </div>
                <div className="mini-input">
                  <span className="ic" />
                  <span className="date-range">JUL 12 &ndash; JUL 19</span>
                </div>
              </div>
              <h4>Where are you headed?</h4>
              <p>
                Enter your destination and travel dates. We&apos;ll find travelers on the same path.
              </p>
            </div>

            {/* Step 02 */}
            <div className="step">
              <div className="step-header">
                <span className="step-num">STEP 02</span>
                <div className="step-dots">
                  <span />
                  <span className="on" />
                  <span />
                </div>
              </div>
              <div className="mini">
                <span className="mini-label">Travelers nearby</span>
                <div className="match-row hi">
                  <div className="match-av" />
                  <div className="match-info">
                    <div className="match-name">Mika, 26</div>
                    <div className="match-meta">From Berlin</div>
                  </div>
                  <span className="match-overlap">92% match</span>
                </div>
                <div className="match-row">
                  <div className="match-av" />
                  <div className="match-info">
                    <div className="match-name">James, 31</div>
                    <div className="match-meta">From Toronto</div>
                  </div>
                  <span className="match-overlap">87% match</span>
                </div>
                <div className="match-row">
                  <div className="match-av" />
                  <div className="match-info">
                    <div className="match-name">Priya, 29</div>
                    <div className="match-meta">From Mumbai</div>
                  </div>
                  <span className="match-overlap">84% match</span>
                </div>
              </div>
              <h4>Browse your matches</h4>
              <p>
                See verified travelers heading to the same city, same week. Pick who you want to
                meet.
              </p>
            </div>

            {/* Step 03 */}
            <div className="step">
              <div className="step-header">
                <span className="step-num">STEP 03</span>
                <div className="step-dots">
                  <span />
                  <span />
                  <span className="on" />
                </div>
              </div>
              <div className="mini">
                <div className="confirm-head">
                  <span className="where serif">Coffee in Shibuya</span>
                  <span className="when mono">Jul 14, 3pm</span>
                </div>
                <div className="confirm-body">
                  <div className="line">
                    You, Mika, and James are confirmed for coffee at Onibus Coffee in Shibuya.
                  </div>
                </div>
                <div className="confirm-attendees">
                  <div className="stack2">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="count">3 travelers</span>
                </div>
                <button className="confirm-btn">&#10003; Meetup confirmed</button>
              </div>
              <h4>Meet up for real</h4>
              <p>Suggest a time and place. Confirm with one tap. No endless group chats.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Who it&apos;s for ── */}
      <section className="who-strip" id="who">
        <div className="who-inner">
          <div>
            <span className="kicker">Who it&apos;s for</span>
            <div className="who-tags">
              <span className="who-tag">Solo backpackers</span>
              <span className="who-tag">Digital nomads</span>
              <span className="who-tag">Career-break travelers</span>
              <span className="who-tag">Extroverted introverts</span>
              <span className="who-tag no">Group tour seekers</span>
              <span className="who-tag no">Cruise package buyers</span>
              <span className="who-tag no">All-inclusive resort fans</span>
            </div>
          </div>
          <p className="who-text">
            Built for people who book their own flights, pack light, and want someone to grab dinner
            with in a city where they know <em>no one</em>.
          </p>
        </div>
      </section>

      {/* ── Founder ── */}
      {tweaks.founder && (
        <section className="founder" id="founder">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="kicker">03 / Founder note</span>
                <h2>Why I built this</h2>
              </div>
            </div>
            <div className="founder-grid">
              <div className="founder-photo">
                <span className="tag">Founder</span>
              </div>
              <div>
                <blockquote>
                  &ldquo;I spent two years traveling solo across 30 countries. The best moments were
                  never the sights &mdash; they were the people I met along the way. I built
                  SoloAdventurer so you don&apos;t have to rely on luck to find your people.&rdquo;
                </blockquote>
                <div className="signature">Anthony</div>
                <div className="attr">
                  <span className="name">Anthony Foran</span>
                  <span>Founder &amp; CEO, SoloAdventurer</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Safety ── */}
      <section className="safety" id="safety">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">04 / Trust &amp; safety</span>
              <h2>Your safety is non-negotiable</h2>
            </div>
            <p className="lead">
              Every feature is designed so you feel confident meeting strangers in a new city.
            </p>
          </div>
          <div className="safety-grid">
            <div className="safety-item">
              <div className="check">&#10003;</div>
              <h4>Photo verification</h4>
              <p>
                Real-time selfie verification ensures every profile matches the person you meet.
              </p>
            </div>
            <div className="safety-item">
              <div className="check">&#10003;</div>
              <h4>ID verification</h4>
              <p>Government ID check for all members before they can message or meet anyone.</p>
            </div>
            <div className="safety-item">
              <div className="check">&#10003;</div>
              <h4>Meetup check-ins</h4>
              <p>
                Automated safety check-ins during meetups with one-tap &ldquo;I&apos;m safe&rdquo;
                confirmation.
              </p>
            </div>
            <div className="safety-item">
              <div className="check">&#10003;</div>
              <h4>Report &amp; block</h4>
              <p>Instant blocking and reporting with our 24/7 trust and safety team monitoring.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="footer-cta">
        <div className="container">
          <div className="scarcity-bar">
            <div className="left">
              <span className="tag-live">LIVE</span>
              <span>Waitlist open</span>
            </div>
            <div className="bar">
              <span style={{ width: `${((1000 - scarcityLeft) / 1000) * 100}%` }} />
            </div>
            <div className="right">{scarcityLeft.toLocaleString()} / 1,000 left</div>
          </div>
          <h2>
            Don&apos;t travel solo, <em>travel connected</em>
          </h2>
          <form
            className="inline-form"
            onSubmit={e => {
              e.preventDefault()
              const input = (e.target as HTMLFormElement).querySelector('input')
              if (input?.value && /\S+@\S+\.\S+/.test(input.value)) {
                setEmail(input.value)
                setFormState('success')
              }
            }}
          >
            <input type="email" placeholder="Enter your email" />
            <button type="submit">
              Join now <span>&rarr;</span>
            </button>
          </form>
          <div className="footer-tag">It&apos;s free. It always will be.</div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer>
        <span>&copy; {mounted ? new Date().getFullYear() : '2026'} SoloAdventurer</span>
        <div>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="mailto:hello@soloadventurer.com">hello@soloadventurer.com</a>
        </div>
      </footer>

      {/* ── Tweaks panel ── */}
      <button
        onClick={() => setTweaksOpen(v => !v)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 100,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '1px solid var(--wl-rule)',
          background: 'var(--wl-surface)',
          color: 'var(--wl-ink)',
          cursor: 'pointer',
          fontSize: 16,
          display: 'grid',
          placeItems: 'center',
        }}
        aria-label="Toggle tweaks"
      >
        &#9881;
      </button>

      {tweaksOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 64,
            right: 20,
            zIndex: 100,
            background: 'var(--wl-surface)',
            border: '1px solid var(--wl-rule)',
            borderRadius: 14,
            padding: '16px 18px',
            width: 240,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            fontSize: 13,
            boxShadow: '0 12px 32px -8px rgba(0,0,0,.18)',
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span
              style={{
                fontFamily: 'var(--font-geist), monospace',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '.12em',
                color: 'var(--wl-ink-mute)',
              }}
            >
              Headline
            </span>
            <select
              value={tweaks.headline}
              onChange={e => setTweaks(t => ({ ...t, headline: e.target.value }))}
              style={{
                height: 32,
                borderRadius: 8,
                border: '1px solid var(--wl-rule)',
                background: 'var(--wl-bg)',
                padding: '0 8px',
                font: 'inherit',
                fontSize: 12,
                color: 'var(--wl-ink)',
              }}
            >
              <option value="your-people">Your people are already there</option>
              <option value="never-alone">Travel solo. Never alone.</option>
              <option value="new-social">Solo is the new social</option>
              <option value="found-you">We found your travel people</option>
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span
              style={{
                fontFamily: 'var(--font-geist), monospace',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '.12em',
                color: 'var(--wl-ink-mute)',
              }}
            >
              CTA copy
            </span>
            <select
              value={tweaks.cta}
              onChange={e => setTweaks(t => ({ ...t, cta: e.target.value }))}
              style={{
                height: 32,
                borderRadius: 8,
                border: '1px solid var(--wl-rule)',
                background: 'var(--wl-bg)',
                padding: '0 8px',
                font: 'inherit',
                fontSize: 12,
                color: 'var(--wl-ink)',
              }}
            >
              <option value="default">Save my spot</option>
              <option value="urgent">Claim your spot</option>
              <option value="exclusive">Get early access</option>
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span
              style={{
                fontFamily: 'var(--font-geist), monospace',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '.12em',
                color: 'var(--wl-ink-mute)',
              }}
            >
              Hero layout
            </span>
            <select
              value={tweaks.heroLayout}
              onChange={e => setTweaks(t => ({ ...t, heroLayout: e.target.value }))}
              style={{
                height: 32,
                borderRadius: 8,
                border: '1px solid var(--wl-rule)',
                background: 'var(--wl-bg)',
                padding: '0 8px',
                font: 'inherit',
                fontSize: 12,
                color: 'var(--wl-ink)',
              }}
            >
              <option value="split">Split</option>
              <option value="overlay">Overlay</option>
              <option value="typographic">Typographic</option>
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span
              style={{
                fontFamily: 'var(--font-geist), monospace',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '.12em',
                color: 'var(--wl-ink-mute)',
              }}
            >
              Theme
            </span>
            <select
              value={tweaks.theme}
              onChange={e => setTweaks(t => ({ ...t, theme: e.target.value }))}
              style={{
                height: 32,
                borderRadius: 8,
                border: '1px solid var(--wl-rule)',
                background: 'var(--wl-bg)',
                padding: '0 8px',
                font: 'inherit',
                fontSize: 12,
                color: 'var(--wl-ink)',
              }}
            >
              <option value="warm">Warm</option>
              <option value="moody">Moody</option>
              <option value="daylight">Daylight</option>
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span
              style={{
                fontFamily: 'var(--font-geist), monospace',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '.12em',
                color: 'var(--wl-ink-mute)',
              }}
            >
              Founder section
            </span>
            <select
              value={tweaks.founder ? 'show' : 'hide'}
              onChange={e => setTweaks(t => ({ ...t, founder: e.target.value === 'show' }))}
              style={{
                height: 32,
                borderRadius: 8,
                border: '1px solid var(--wl-rule)',
                background: 'var(--wl-bg)',
                padding: '0 8px',
                font: 'inherit',
                fontSize: 12,
                color: 'var(--wl-ink)',
              }}
            >
              <option value="show">Show</option>
              <option value="hide">Hide</option>
            </select>
          </label>
        </div>
      )}
    </div>
  )
}
