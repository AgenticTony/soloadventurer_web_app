import '../styles/globals.css'
import { Suspense } from 'react'
import { DM_Sans, Playfair_Display, Instrument_Serif, Geist } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { AnalyticsProvider } from '@/contexts/AnalyticsContext'
import { PageViewTracker } from '@/components/analytics/PageViewTracker'
import { ConsentBanner } from '@/components/analytics/ConsentBanner'
import { ThemeProvider } from 'next-themes'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  display: 'swap',
  weight: '400',
})

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

export const metadata = {
  title: 'SoloAdventurer - Connect with Solo Travelers',
  description:
    'A social platform designed specifically for solo travelers to connect, share experiences, and find travel companions.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dmSans.variable} ${playfair.variable} ${instrumentSerif.variable} ${geist.variable}`}
    >
      <body className="font-sans" suppressHydrationWarning>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AnalyticsProvider>
            <AuthProvider>
              <ToastProvider>{children}</ToastProvider>
            </AuthProvider>
            <Suspense fallback={null}>
              <PageViewTracker />
            </Suspense>
            <ConsentBanner />
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
