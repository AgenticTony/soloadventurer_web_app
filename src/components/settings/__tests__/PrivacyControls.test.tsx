import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { PrivacyControls } from '../PrivacyControls';
import { PrivacyProvider } from '@/contexts/PrivacyContext';

jest.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showInfo: jest.fn(),
    showWarning: jest.fn(),
    showToast: jest.fn(),
    dismissToast: jest.fn(),
    dismissAllToasts: jest.fn()
  }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PrivacyProvider>{children}</PrivacyProvider>
);

// Mock the userService to avoid real API calls in tests
jest.mock('@/services/users/userService', () => ({
  userService: {
    getUserProfile: jest.fn().mockResolvedValue({
      id: 'test-user',
      name: 'Test User',
      username: 'testuser',
      avatarUrl: null
    }),
    searchUsers: jest.fn().mockResolvedValue([])
  }
}));

describe('PrivacyControls', () => {
  test('renders privacy controls component', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <PrivacyControls />
        </TestWrapper>
      );
    });

    expect(screen.getByText('Privacy Controls')).toBeInTheDocument();
    expect(screen.getByText(/Block users or hide your profile/)).toBeInTheDocument();
  });

  test('shows empty states initially', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <PrivacyControls />
        </TestWrapper>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("You haven't blocked any users yet")).toBeInTheDocument();
    });
  });

  test('renders tabs for blocked and hidden users', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <PrivacyControls />
        </TestWrapper>
      );
    });

    // Text appears in both tab button and heading, so use getAllByText
    expect(screen.getAllByText(/Blocked Users/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Hidden From/).length).toBeGreaterThanOrEqual(1);
  });

  test('shows add user functionality', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <PrivacyControls />
        </TestWrapper>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Block User')).toBeInTheDocument();
    });
  });
});