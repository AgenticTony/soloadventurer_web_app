import { renderHook, act } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { useUnsavedChanges } from '../useUnsavedChanges'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock window.confirm
const mockConfirm = jest.fn()
global.confirm = mockConfirm

// Mock window.addEventListener and removeEventListener
const mockAddEventListener = jest.fn()
const mockRemoveEventListener = jest.fn()
global.addEventListener = mockAddEventListener
global.removeEventListener = mockRemoveEventListener

const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn()
}

describe('useUnsavedChanges', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    mockConfirm.mockReturnValue(true)
  })

  it('should not interfere with navigation when no unsaved changes', () => {
    renderHook(() =>
      useUnsavedChanges({
        hasUnsavedChanges: false
      })
    )

    // Router.push should work normally
    act(() => {
      mockRouter.push('/some-path')
    })

    expect(mockPush).toHaveBeenCalledWith('/some-path')
    expect(mockConfirm).not.toHaveBeenCalled()
  })

  it('should show confirmation when navigating with unsaved changes', () => {
    renderHook(() =>
      useUnsavedChanges({
        hasUnsavedChanges: true
      })
    )

    mockConfirm.mockReturnValue(true)

    // Router.push should show confirmation
    act(() => {
      mockRouter.push('/some-path')
    })

    expect(mockConfirm).toHaveBeenCalledWith('You have unsaved changes. Are you sure you want to leave?')
    expect(mockPush).toHaveBeenCalledWith('/some-path')
  })

  it('should prevent navigation when user cancels confirmation', () => {
    renderHook(() =>
      useUnsavedChanges({
        hasUnsavedChanges: true
      })
    )

    mockConfirm.mockReturnValue(false)

    // Router.push should be blocked
    act(() => {
      mockRouter.push('/some-path')
    })

    expect(mockConfirm).toHaveBeenCalledWith('You have unsaved changes. Are you sure you want to leave?')
    expect(mockPush).not.toHaveBeenCalledWith('/some-path')
  })

  it('should use custom message when provided', () => {
    const customMessage = 'Custom unsaved changes message'
    renderHook(() =>
      useUnsavedChanges({
        hasUnsavedChanges: true,
        message: customMessage
      })
    )

    act(() => {
      mockRouter.push('/some-path')
    })

    expect(mockConfirm).toHaveBeenCalledWith(customMessage)
  })

  it('should add beforeunload listener when hasUnsavedChanges is true', () => {
    renderHook(() =>
      useUnsavedChanges({
        hasUnsavedChanges: true
      })
    )

    expect(mockAddEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function))
  })

  it('should remove beforeunload listener when hasUnsavedChanges becomes false', () => {
    const { rerender } = renderHook(
      ({ hasUnsavedChanges }) =>
        useUnsavedChanges({
          hasUnsavedChanges
        }),
      {
        initialProps: { hasUnsavedChanges: true }
      }
    )

    expect(mockAddEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function))

    // Change to false
    rerender({ hasUnsavedChanges: false })

    expect(mockRemoveEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function))
  })

  it('should clean up event listener on unmount', () => {
    const { unmount } = renderHook(() =>
      useUnsavedChanges({
        hasUnsavedChanges: true
      })
    )

    unmount()

    expect(mockRemoveEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function))
  })

  it('should provide confirmNavigation helper function', () => {
    const { result } = renderHook(() =>
      useUnsavedChanges({
        hasUnsavedChanges: true
      })
    )

    const mockCallback = jest.fn()
    mockConfirm.mockReturnValue(true)

    act(() => {
      result.current.confirmNavigation(mockCallback)
    })

    expect(mockConfirm).toHaveBeenCalledWith('You have unsaved changes. Are you sure you want to leave?')
    expect(mockCallback).toHaveBeenCalled()
  })

  it('should not call callback when confirmNavigation is cancelled', () => {
    const { result } = renderHook(() =>
      useUnsavedChanges({
        hasUnsavedChanges: true
      })
    )

    const mockCallback = jest.fn()
    mockConfirm.mockReturnValue(false)

    act(() => {
      result.current.confirmNavigation(mockCallback)
    })

    expect(mockConfirm).toHaveBeenCalled()
    expect(mockCallback).not.toHaveBeenCalled()
  })

  it('should call callback immediately when no unsaved changes', () => {
    const { result } = renderHook(() =>
      useUnsavedChanges({
        hasUnsavedChanges: false
      })
    )

    const mockCallback = jest.fn()

    act(() => {
      result.current.confirmNavigation(mockCallback)
    })

    expect(mockConfirm).not.toHaveBeenCalled()
    expect(mockCallback).toHaveBeenCalled()
  })
})