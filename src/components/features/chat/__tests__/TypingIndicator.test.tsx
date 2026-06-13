import React from 'react'
import { render, screen } from '@testing-library/react'
import { TypingIndicator } from '../TypingIndicator'

// ── Tests ──────────────────────────────────────────────────────

describe('TypingIndicator', () => {
  it('renders "{name} is typing" text', () => {
    render(<TypingIndicator name="Alice" />)
    expect(screen.getByText(/Alice is typing/)).toBeInTheDocument()
  })

  it('renders three animated dots', () => {
    const { container } = render(<TypingIndicator name="Bob" />)
    // Each dot is an inline span with rounded-full and bg-gray-400
    const dots = container.querySelectorAll('.rounded-full.bg-gray-400')
    expect(dots.length).toBe(3)
  })

  it('renders with any display name', () => {
    render(<TypingIndicator name="Traveler" />)
    expect(screen.getByText(/Traveler is typing/)).toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    const { container } = render(<TypingIndicator name="Alice" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('border-b')
    expect(wrapper.className).toContain('bg-gray-50')
  })
})
