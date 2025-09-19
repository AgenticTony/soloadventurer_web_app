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
    expect(screen.getByLabelText(/Don't share my location/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Share with friends only/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Share with everyone/)).toBeInTheDocument();
  });

  test('shows correct default selection', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/Don't share my location/)).toBeChecked();
    expect(screen.getByLabelText(/Share with friends only/)).not.toBeChecked();
    expect(screen.getByLabelText(/Share with everyone/)).not.toBeChecked();
  });

  test('allows changing location sharing level', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    );

    fireEvent.click(screen.getByLabelText(/Share with friends only/));
    expect(screen.getByLabelText(/Share with friends only/)).toBeChecked();
    expect(screen.getByLabelText(/Don't share my location/)).not.toBeChecked();

    fireEvent.click(screen.getByLabelText(/Share with everyone/));
    expect(screen.getByLabelText(/Share with everyone/)).toBeChecked();
    expect(screen.getByLabelText(/Share with friends only/)).not.toBeChecked();
  });

  test('shows precise location toggle only when sharing is enabled', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    );

    expect(screen.queryByText('Precise Location')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Share with friends only/));
    expect(screen.getByText('Precise Location')).toBeInTheDocument();
  });

  test('automatically enables precise location when sharing with everyone', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    );

    fireEvent.click(screen.getByLabelText(/Share with everyone/));

    const preciseToggle = screen.getByRole('switch');
    expect(preciseToggle).toBeChecked();
  });

  test('disables precise location when sharing is turned off', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    );

    fireEvent.click(screen.getByLabelText(/Share with friends only/));

    const preciseToggle = screen.getByRole('switch');
    fireEvent.click(preciseToggle);
    expect(preciseToggle).toBeChecked();

    fireEvent.click(screen.getByLabelText(/Don't share my location/));
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  test('shows privacy summary', () => {
    render(
      <TestWrapper>
        <LocationSettings />
      </TestWrapper>
    );

    expect(screen.getByText(/Your location is completely private/)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Share with friends only/));
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

    expect(screen.getByText(/Most private option/)).toBeInTheDocument();
    expect(screen.getByText(/Visible to people you follow/)).toBeInTheDocument();
    expect(screen.getByText(/Visible to all SoloAdventurer users/)).toBeInTheDocument();
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