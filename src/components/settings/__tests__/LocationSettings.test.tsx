import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocationSettings } from '../LocationSettings';
import { PrivacyProvider } from '@/contexts/PrivacyContext';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PrivacyProvider>{children}</PrivacyProvider>
);

describe('LocationSettings', () => {
  test('renders location sharing options', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    );

    expect(screen.getByText('Location Privacy')).toBeInTheDocument();
    expect(screen.getByLabelText(/Off/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Friends Only/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Everyone/)).toBeInTheDocument();
  });

  test('shows correct default selection', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/Off/)).toBeChecked();
    expect(screen.getByLabelText(/Friends Only/)).not.toBeChecked();
    expect(screen.getByLabelText(/Everyone/)).not.toBeChecked();
  });

  test('allows changing location sharing level', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    );

    fireEvent.click(screen.getByLabelText(/Friends Only/));
    expect(screen.getByLabelText(/Friends Only/)).toBeChecked();
    expect(screen.getByLabelText(/Off/)).not.toBeChecked();

    fireEvent.click(screen.getByLabelText(/Everyone/));
    expect(screen.getByLabelText(/Everyone/)).toBeChecked();
    expect(screen.getByLabelText(/Friends Only/)).not.toBeChecked();
  });

  test('shows precise location toggle only when sharing is enabled', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    );

    expect(screen.queryByText('Precise Location')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Friends Only/));
    expect(screen.getByText('Precise Location')).toBeInTheDocument();
  });

  test('automatically enables precise location when sharing with everyone', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    );

    fireEvent.click(screen.getByLabelText(/Everyone/));

    const preciseToggle = screen.getByRole('switch');
    expect(preciseToggle).toBeChecked();
  });

  test('disables precise location when sharing is turned off', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    );

    fireEvent.click(screen.getByLabelText(/Friends Only/));

    const preciseToggle = screen.getByRole('switch');
    fireEvent.click(preciseToggle);
    expect(preciseToggle).toBeChecked();

    fireEvent.click(screen.getByLabelText(/Off/));
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  test('shows privacy summary', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    );

    expect(screen.getByText(/Your location is completely private/)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Friends Only/));
    expect(screen.getByText(/Your approximate location is visible to friends/)).toBeInTheDocument();

    const preciseToggle = screen.getByRole('switch');
    fireEvent.click(preciseToggle);
    expect(screen.getByText(/Your exact location is visible to friends/)).toBeInTheDocument();
  });

  test('displays location sharing descriptions', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    );

    expect(screen.getByText(/Your location is completely private/)).toBeInTheDocument();
    expect(screen.getByText(/Only people you follow and who follow you back/)).toBeInTheDocument();
    expect(screen.getByText(/All users can see your location/)).toBeInTheDocument();
  });

  test('shows advanced settings toggle', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    );

    expect(screen.getByText(/Advanced Settings/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Show Advanced Settings/ })).toBeInTheDocument();
  });
});