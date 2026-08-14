import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * Shared shell for the legal pages (/privacy, /terms).
 *
 * Visual language mirrors the waitlist page: warm paper background, ink
 * headings in the display serif, teal accents. Server-rendered (no client
 * JS) so the pages are fast, indexable, and printable.
 */
export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <Link href="/waitlist" className="flex items-center gap-2.5 no-underline">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand font-display text-lg font-bold text-brand-foreground">
              S
            </span>
            <span className="font-display text-lg text-foreground">SoloAdventurer</span>
          </Link>
          <Link
            href="/waitlist"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground no-underline transition-colors hover:bg-muted"
          >
            Join the waitlist
          </Link>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-2xl px-6 pb-24 pt-12">
        <h1 className="font-display text-4xl leading-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-foreground">
          {children}
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-6 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} SoloAdventurer</span>
          <Link href="/privacy" className="no-underline hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="no-underline hover:text-foreground">
            Terms
          </Link>
          <a
            href="mailto:hello@soloadventurer.travel"
            className="no-underline hover:text-foreground"
          >
            hello@soloadventurer.travel
          </a>
        </div>
      </footer>
    </div>
  )
}

/** A titled section inside a legal page. */
export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-xl text-foreground">{heading}</h2>
      <div className="space-y-3 text-muted-foreground">{children}</div>
    </section>
  )
}
