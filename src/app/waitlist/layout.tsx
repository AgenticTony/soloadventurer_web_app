import type { Metadata } from 'next'

/**
 * Route metadata for /waitlist.
 *
 * The waitlist page itself is a client component ('use client'), so the
 * route's metadata lives here in a server layout — the Next.js-idiomatic
 * place for it. This is the front door for anonymous traffic (middleware
 * redirects `/` here), so these tags are what search engines and every
 * shared link preview render.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.soloadventurer.travel'

const title = 'SoloAdventurer — Travel solo. Never alone.'
const description =
  'Meet verified solo travelers in your city. Mutual opt-in messaging, ID-verified badges, and safety built in from day one. Join the free private beta waitlist.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/waitlist' },
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/waitlist`,
    siteName: 'SoloAdventurer',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-waitlist.jpg',
        width: 1200,
        height: 630,
        alt: 'Two travelers meeting at a rooftop cafe in Lisbon at golden hour',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og-waitlist.jpg'],
  },
}

export default function WaitlistLayout({ children }: { children: React.ReactNode }) {
  return children
}
