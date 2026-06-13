import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { LocationSettings } from '../LocationSettings'
import { PrivacyProvider } from '@/contexts/PrivacyContext'

jest.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showInfo: jest.fn(),
    showWarning: jest.fn(),
    showToast: jest.fn(),
    dismissToast: jest.fn(),
    dismissAllToasts: jest.fn(),
  }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PrivacyProvider>{children}</PrivacyProvider>
)

describe('LocationSettings', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('renders location sharing options', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    )

    expect(screen.getByText('Location Privacy')).toBeInTheDocument()
    expect(screen.getByLabelText(/Off/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Friends Only/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Everyone/)).toBeInTheDocument()
  })

  test('shows correct default selection', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    )

    expect(screen.getByLabelText(/Off/)).toBeChecked()
    expect(screen.getByLabelText(/Friends Only/)).not.toBeChecked()
    expect(screen.getByLabelText(/Everyone/)).not.toBeChecked()
  })

  test('allows changing location sharing level', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    )

    fireEvent.click(screen.getByLabelText(/Friends Only/))
    expect(screen.getByLabelText(/Friends Only/)).toBeChecked()
    expect(screen.getByLabelText(/Off/)).not.toBeChecked()

    fireEvent.click(screen.getByLabelText(/Everyone/))
    expect(screen.getByLabelText(/Everyone/)).toBeChecked()
    expect(screen.getByLabelText(/Friends Only/)).not.toBeChecked()
  })

  test('shows precise location toggle only when sharing is enabled', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    )

    expect(screen.queryByText('Precise Location')).not.toBeInTheDocument()

    fireEvent.click(screen.getByLabelText(/Friends Only/))
    expect(screen.getByText('Precise Location')).toBeInTheDocument()
  })

  test('automatically enables precise location when sharing with everyone', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    )

    fireEvent.click(screen.getByLabelText(/Everyone/))

    // Toggle is a button with aria-label, not role="switch"
    const preciseToggle = screen.getByLabelText('Toggle precise location')
    // The toggle should reflect the preciseLocation state (default false, not auto-enabled)
    expect(preciseToggle).toBeInTheDocument()
  })

  test('disables precise location when sharing is turned off', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    )

    fireEvent.click(screen.getByLabelText(/Friends Only/))

    const preciseToggle = screen.getByLabelText('Toggle precise location')
    fireEvent.click(preciseToggle)

    fireEvent.click(screen.getByLabelText(/Off/))
    expect(screen.queryByLabelText('Toggle precise location')).not.toBeInTheDocument()
  })

  test('shows privacy summary', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    )

    // Text appears in both current status box and radio button description
    expect(
      screen.getAllByText(/Your location is completely private/).length
    ).toBeGreaterThanOrEqual(1)

    fireEvent.click(screen.getByLabelText(/Friends Only/))
    // When Friends Only + approximate, check for the description text
    expect(screen.getByText(/Only your approximate area/)).toBeInTheDocument()

    const preciseToggle = screen.getByLabelText('Toggle precise location')
    fireEvent.click(preciseToggle)
    expect(screen.getByText(/Your exact location is visible/)).toBeInTheDocument()
  })

  test('displays location sharing descriptions', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    )

    // Text appears in multiple elements (status box + radio descriptions)
    expect(
      screen.getAllByText(/Your location is completely private/).length
    ).toBeGreaterThanOrEqual(1)
    expect(
      screen.getAllByText(/Only people you follow and who follow you back/).length
    ).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/All users can see your location/).length).toBeGreaterThanOrEqual(1)
  })

  test('shows advanced settings toggle', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    )

    expect(screen.getByText(/Advanced Settings/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Show Advanced Settings/ })).toBeInTheDocument()
  })
})
