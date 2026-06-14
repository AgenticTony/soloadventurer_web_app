'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'
import { clsx } from 'clsx'

type ThemeOption = 'light' | 'system' | 'dark'

const OPTIONS: ReadonlyArray<{ value: ThemeOption; label: string; Icon: typeof Sun }> = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'system', label: 'Auto (follow system)', Icon: Monitor },
  { value: 'dark', label: 'Dark', Icon: Moon },
]

/**
 * Three-way color-theme control: Light / Auto (follow system) / Dark.
 *
 * Powered by next-themes. `defaultTheme="system"` + `enableSystem` on the
 * ThemeProvider (see app/layout.tsx) makes "Auto" live-follow the OS
 * `prefers-color-scheme`. The active option is only highlighted after mount to
 * avoid an SSR/CSR hydration mismatch (the resolved theme is a client-only
 * value); next-themes' own blocking script still applies the correct theme
 * pre-paint, so there is no flash of the wrong theme.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <div
      role="group"
      aria-label="Color theme"
      className={clsx('flex items-center gap-0.5 rounded-2xl bg-muted p-0.5', className)}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = mounted && theme === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-label={label}
            aria-pressed={active}
            title={label}
            className={clsx(
              'flex items-center justify-center rounded-xl p-1.5 transition-colors',
              active
                ? 'bg-card text-brand-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        )
      })}
    </div>
  )
}
