import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useTheme } from 'next-themes'

jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}))

const setTheme = jest.fn()
const mockUseTheme = useTheme as jest.Mock

beforeEach(() => {
  setTheme.mockReset()
  mockUseTheme.mockReturnValue({ theme: 'system', setTheme })
})

describe('ThemeToggle', () => {
  it('renders Light, Auto (follow system), and Dark options', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: 'Light' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Auto (follow system)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dark' })).toBeInTheDocument()
  })

  it('calls setTheme with the chosen value when each option is clicked', () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button', { name: 'Dark' }))
    expect(setTheme).toHaveBeenCalledWith('dark')
    fireEvent.click(screen.getByRole('button', { name: 'Light' }))
    expect(setTheme).toHaveBeenCalledWith('light')
    fireEvent.click(screen.getByRole('button', { name: 'Auto (follow system)' }))
    expect(setTheme).toHaveBeenCalledWith('system')
  })

  it('marks only the active option as pressed once mounted (no SSR mismatch)', () => {
    mockUseTheme.mockReturnValue({ theme: 'dark', setTheme })
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Light' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Auto (follow system)' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('groups the options under an accessible "Color theme" label', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('group', { name: 'Color theme' })).toBeInTheDocument()
  })
})
