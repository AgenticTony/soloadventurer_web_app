import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PrivacyProvider, usePrivacy } from '../PrivacyContext';

const TestComponent = () => {
  const {
    settings,
    updateLocationSharing,
    togglePreciseLocation,
    blockUser,
    unblockUser,
    hideFromUser,
    showToUser,
    resetToDefaults
  } = usePrivacy();

  return (
    <div>
      <div data-testid="location-sharing">{settings.locationSharing}</div>
      <div data-testid="precise-location">{settings.preciseLocation.toString()}</div>
      <div data-testid="blocked-users">{settings.blockedUsers.join(',')}</div>
      <div data-testid="hidden-users">{settings.hideFromUsers.join(',')}</div>
      <button onClick={() => updateLocationSharing('friends')}>Share with friends</button>
      <button onClick={() => updateLocationSharing('everyone')}>Share with everyone</button>
      <button onClick={() => updateLocationSharing('off')}>Stop sharing</button>
      <button onClick={togglePreciseLocation}>Toggle precise</button>
      <button onClick={() => blockUser('user1')}>Block user1</button>
      <button onClick={() => unblockUser('user1')}>Unblock user1</button>
      <button onClick={() => hideFromUser('user2')}>Hide from user2</button>
      <button onClick={() => showToUser('user2')}>Show to user2</button>
      <button onClick={resetToDefaults}>Reset</button>
    </div>
  );
};

describe('PrivacyContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('provides default privacy settings', () => {
    render(
      <PrivacyProvider>
        <TestComponent />
      </PrivacyProvider>
    );

    expect(screen.getByTestId('location-sharing')).toHaveTextContent('off');
    expect(screen.getByTestId('precise-location')).toHaveTextContent('false');
    expect(screen.getByTestId('blocked-users')).toHaveTextContent('');
    expect(screen.getByTestId('hidden-users')).toHaveTextContent('');
  });

  test('updates location sharing setting', () => {
    render(
      <PrivacyProvider>
        <TestComponent />
      </PrivacyProvider>
    );

    fireEvent.click(screen.getByText('Share with friends'));
    expect(screen.getByTestId('location-sharing')).toHaveTextContent('friends');

    fireEvent.click(screen.getByText('Share with everyone'));
    expect(screen.getByTestId('location-sharing')).toHaveTextContent('everyone');

    fireEvent.click(screen.getByText('Stop sharing'));
    expect(screen.getByTestId('location-sharing')).toHaveTextContent('off');
  });

  test('does not auto-enable precise location when sharing with everyone', () => {
    render(
      <PrivacyProvider>
        <TestComponent />
      </PrivacyProvider>
    );

    fireEvent.click(screen.getByText('Share with everyone'));
    expect(screen.getByTestId('precise-location')).toHaveTextContent('false');
  });

  test('disables precise location when sharing is turned off', () => {
    render(
      <PrivacyProvider>
        <TestComponent />
      </PrivacyProvider>
    );

    fireEvent.click(screen.getByText('Share with friends'));
    fireEvent.click(screen.getByText('Toggle precise'));
    expect(screen.getByTestId('precise-location')).toHaveTextContent('true');

    fireEvent.click(screen.getByText('Stop sharing'));
    expect(screen.getByTestId('precise-location')).toHaveTextContent('false');
  });

  test('manages blocked users', () => {
    render(
      <PrivacyProvider>
        <TestComponent />
      </PrivacyProvider>
    );

    fireEvent.click(screen.getByText('Block user1'));
    expect(screen.getByTestId('blocked-users')).toHaveTextContent('user1');

    fireEvent.click(screen.getByText('Unblock user1'));
    expect(screen.getByTestId('blocked-users')).toHaveTextContent('');
  });

  test('manages hidden users', () => {
    render(
      <PrivacyProvider>
        <TestComponent />
      </PrivacyProvider>
    );

    fireEvent.click(screen.getByText('Hide from user2'));
    expect(screen.getByTestId('hidden-users')).toHaveTextContent('user2');

    fireEvent.click(screen.getByText('Show to user2'));
    expect(screen.getByTestId('hidden-users')).toHaveTextContent('');
  });

  test('persists settings to localStorage', async () => {
    render(
      <PrivacyProvider>
        <TestComponent />
      </PrivacyProvider>
    );

    fireEvent.click(screen.getByText('Share with friends'));
    fireEvent.click(screen.getByText('Block user1'));

    await waitFor(() => {
      const stored = localStorage.getItem('soloadventurer_privacy_settings');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.locationSharing).toBe('friends');
      expect(parsed.blockedUsers).toContain('user1');
    });
  });

  test('loads settings from localStorage', () => {
    const mockSettings = {
      locationSharing: 'everyone',
      preciseLocation: true,
      blockedUsers: ['user1', 'user2'],
      hideFromUsers: ['user3'],
      showPrivacyStatus: false
    };
    localStorage.setItem('soloadventurer_privacy_settings', JSON.stringify(mockSettings));

    render(
      <PrivacyProvider>
        <TestComponent />
      </PrivacyProvider>
    );

    expect(screen.getByTestId('location-sharing')).toHaveTextContent('everyone');
    expect(screen.getByTestId('precise-location')).toHaveTextContent('true');
    expect(screen.getByTestId('blocked-users')).toHaveTextContent('user1,user2');
    expect(screen.getByTestId('hidden-users')).toHaveTextContent('user3');
  });

  test('resets to defaults', () => {
    render(
      <PrivacyProvider>
        <TestComponent />
      </PrivacyProvider>
    );

    fireEvent.click(screen.getByText('Share with everyone'));
    fireEvent.click(screen.getByText('Block user1'));

    fireEvent.click(screen.getByText('Reset'));

    expect(screen.getByTestId('location-sharing')).toHaveTextContent('off');
    expect(screen.getByTestId('precise-location')).toHaveTextContent('false');
    expect(screen.getByTestId('blocked-users')).toHaveTextContent('');
    expect(screen.getByTestId('hidden-users')).toHaveTextContent('');
  });

  test('handles localStorage errors gracefully', async () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = jest.fn(() => {
      throw new Error('Storage quota exceeded');
    });

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    render(
      <PrivacyProvider>
        <TestComponent />
      </PrivacyProvider>
    );

    fireEvent.click(screen.getByText('Share with friends'));

    // Wait for the effect to run and the warning to be logged
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save privacy settings to localStorage:', expect.any(Error));
    });

    localStorage.setItem = originalSetItem;
    consoleSpy.mockRestore();
  });
});