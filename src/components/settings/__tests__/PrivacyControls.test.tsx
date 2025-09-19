import React from 'react';
import { render, screen } from '@testing-library/react';
import { PrivacyControls } from '../PrivacyControls';
import { PrivacyProvider } from '@/contexts/PrivacyContext';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PrivacyProvider>{children}</PrivacyProvider>
);

describe('PrivacyControls', () => {
  test('renders privacy controls component', () => {
    render(
      <TestWrapper>
        <PrivacyControls />
      </TestWrapper>
    );

    expect(screen.getByText('Privacy Controls')).toBeInTheDocument();
    expect(screen.getByText(/Block users or hide your profile/)).toBeInTheDocument();
  });

  test('shows empty states initially', () => {
    render(
      <TestWrapper>
        <PrivacyControls />
      </TestWrapper>
    );

    expect(screen.getByText("You haven't blocked any users yet")).toBeInTheDocument();
  });

  test('renders tabs for blocked and hidden users', () => {
    render(
      <TestWrapper>
        <PrivacyControls />
      </TestWrapper>
    );

    expect(screen.getByText(/Blocked Users/)).toBeInTheDocument();
    expect(screen.getByText(/Hidden From/)).toBeInTheDocument();
  });

  test('shows add user functionality', () => {
    render(
      <TestWrapper>
        <PrivacyControls />
      </TestWrapper>
    );

    expect(screen.getByText('Add User')).toBeInTheDocument();
  });
});