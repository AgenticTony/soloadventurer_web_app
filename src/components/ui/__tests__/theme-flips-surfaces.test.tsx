import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { ThemeProvider, useTheme } from 'next-themes'

/**
 * Integration proof for sprint 7.2 item 80 ("Light/dark toggle flips all
 * surfaces"): the real next-themes ThemeProvider must add/remove the `dark`
 * class on <html>, which is what flips every `dark:` Tailwind surface via the
 * `darkMode: ['class']` config.
 *
 * This file deliberately does NOT mock next-themes, so it must live separately
 * from ThemeToggle.test.tsx (jest.mock is file-hoisted).
 */

// Probe that drives the provider to a target theme.
function ThemeProbe({ to }: { to: string }) {
  const { setTheme } = useTheme()
  React.useEffect(() => {
    setTheme(to)
  }, [to, setTheme])
  return null
}

beforeEach(() => {
  document.documentElement.className = ''
  window.localStorage.clear()
})

describe('ThemeProvider surface flip', () => {
  it('adds the `dark` class to <html> for the dark theme', async () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <ThemeProbe to="dark" />
      </ThemeProvider>
    )
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  it('removes the `dark` class from <html> for the light theme', async () => {
    document.documentElement.classList.add('dark')
    render(
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <ThemeProbe to="light" />
      </ThemeProvider>
    )
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })
})
