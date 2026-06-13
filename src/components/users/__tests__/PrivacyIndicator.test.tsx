import React from 'react'
import { render, screen } from '@testing-library/react'
import { PrivacyIndicator } from '../PrivacyIndicator'

describe('PrivacyIndicator', () => {
  test('renders private indicator for off sharing', () => {
    render(<PrivacyIndicator locationSharing="off" />)

    const indicator = screen.getByRole('img')
    expect(indicator).toHaveAttribute('title', 'Location is private')
    expect(indicator).toHaveAttribute('aria-label', 'Location is private')
    expect(indicator).toHaveClass('text-red-600', 'bg-red-100')
  })

  test('renders friends indicator for friends sharing', () => {
    render(<PrivacyIndicator locationSharing="friends" />)

    const indicator = screen.getByRole('img')
    expect(indicator).toHaveAttribute('title', 'Location visible to friends (approximate)')
    expect(indicator).toHaveClass('text-blue-600', 'bg-blue-100')
  })

  test('renders public indicator for everyone sharing', () => {
    render(<PrivacyIndicator locationSharing="everyone" />)

    const indicator = screen.getByRole('img')
    expect(indicator).toHaveAttribute('title', 'Location visible to everyone (approximate)')
    expect(indicator).toHaveClass('text-yellow-600', 'bg-yellow-100')
  })

  test('shows precise location in tooltip when enabled', () => {
    render(<PrivacyIndicator locationSharing="friends" precise={true} />)

    const indicator = screen.getByRole('img')
    expect(indicator).toHaveAttribute('title', 'Location visible to friends (exact)')
  })

  test('renders with text when showText is true', () => {
    render(<PrivacyIndicator locationSharing="friends" showText={true} />)

    expect(screen.getByText('Friends')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  test('shows precise indicator dot when showText is true and precise is enabled', () => {
    render(<PrivacyIndicator locationSharing="friends" precise={true} showText={true} />)

    expect(screen.getByText('Friends')).toBeInTheDocument()
    expect(screen.getByText('•')).toBeInTheDocument()
  })

  test('does not show precise indicator for private sharing', () => {
    render(<PrivacyIndicator locationSharing="off" precise={true} showText={true} />)

    expect(screen.getByText('Private')).toBeInTheDocument()
    expect(screen.queryByText('•')).not.toBeInTheDocument()
  })

  test('applies custom className', () => {
    render(<PrivacyIndicator locationSharing="friends" className="custom-class" />)

    const indicator = screen.getByRole('img')
    expect(indicator).toHaveClass('custom-class')
  })

  test('renders with different sizes', () => {
    const { rerender } = render(
      <PrivacyIndicator locationSharing="friends" size="sm" showText={true} />
    )
    expect(screen.getByText('Friends').parentElement).toHaveClass('text-xs')

    rerender(<PrivacyIndicator locationSharing="friends" size="md" showText={true} />)
    expect(screen.getByText('Friends').parentElement).toHaveClass('text-sm')

    rerender(<PrivacyIndicator locationSharing="friends" size="lg" showText={true} />)
    expect(screen.getByText('Friends').parentElement).toHaveClass('text-base')
  })

  test('handles unknown sharing level gracefully', () => {
    render(<PrivacyIndicator locationSharing={'unknown' as 'off'} />)

    const indicator = screen.getByRole('img')
    expect(indicator).toHaveAttribute('title', 'Location is private')
    expect(indicator).toHaveClass('text-red-600', 'bg-red-100')
  })

  test('has correct accessibility attributes', () => {
    render(<PrivacyIndicator locationSharing="everyone" precise={true} />)

    const indicator = screen.getByRole('img')
    expect(indicator).toHaveAttribute('aria-label', 'Location visible to everyone (exact)')
    expect(indicator).toHaveAttribute('title', 'Location visible to everyone (exact)')
  })
})
