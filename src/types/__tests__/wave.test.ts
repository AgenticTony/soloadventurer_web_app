// Wave Types Tests
// Sprint 3: Wave System Type Guards and Utilities

import {
  Wave,
  WaveType,
  WaveStatus,
  isWaveExpired,
  isMutualWave,
  canRespondToWave,
  WAVE_EXPIRY_DAYS,
  MAX_MESSAGE_LENGTH,
  MAX_WAVES_PER_DAY,
} from '../wave';

describe('Wave Type Guards', () => {
  const mockWave: Wave = {
    id: 'test-wave-1',
    fromUserId: 'user-1',
    toUserId: 'user-2',
    type: 'sent',
    status: 'pending',
    message: 'Hello!',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('isWaveExpired', () => {
    it('should return false for waves that have not expired', () => {
      const futureWave: Wave = {
        ...mockWave,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
      expect(isWaveExpired(futureWave)).toBe(false);
    });

    it('should return true for waves that have expired', () => {
      const expiredWave: Wave = {
        ...mockWave,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      };
      expect(isWaveExpired(expiredWave)).toBe(true);
    });

    it('should handle edge case of exactly current time', () => {
      const nowWave: Wave = {
        ...mockWave,
        expiresAt: new Date().toISOString(),
      };
      // Should be expired (current time is >= expiry)
      expect(isWaveExpired(nowWave)).toBe(true);
    });
  });

  describe('isMutualWave', () => {
    it('should return true for mutual wave type', () => {
      const mutualWave: Wave = {
        ...mockWave,
        type: 'mutual',
      };
      expect(isMutualWave(mutualWave)).toBe(true);
    });

    it('should return true for wave with isMutual flag', () => {
      const flaggedWave: Wave = {
        ...mockWave,
        isMutual: true,
      };
      expect(isMutualWave(flaggedWave)).toBe(true);
    });

    it('should return false for non-mutual waves', () => {
      expect(isMutualWave(mockWave)).toBe(false);
    });
  });

  describe('canRespondToWave', () => {
    it('should return true for pending non-expired waves', () => {
      expect(canRespondToWave(mockWave)).toBe(true);
    });

    it('should return false for non-pending waves', () => {
      const acceptedWave: Wave = {
        ...mockWave,
        status: 'accepted',
      };
      expect(canRespondToWave(acceptedWave)).toBe(false);
    });

    it('should return false for expired waves', () => {
      const expiredWave: Wave = {
        ...mockWave,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      };
      expect(canRespondToWave(expiredWave)).toBe(false);
    });

    it('should return false for declined waves', () => {
      const declinedWave: Wave = {
        ...mockWave,
        status: 'declined',
      };
      expect(canRespondToWave(declinedWave)).toBe(false);
    });
  });
});

describe('Wave Constants', () => {
  it('should have correct expiry days', () => {
    expect(WAVE_EXPIRY_DAYS).toBe(7);
  });

  it('should have reasonable message length limit', () => {
    expect(MAX_MESSAGE_LENGTH).toBe(200);
    expect(MAX_MESSAGE_LENGTH).toBeGreaterThan(0);
  });

  it('should have reasonable daily wave limit', () => {
    expect(MAX_WAVES_PER_DAY).toBe(50);
    expect(MAX_WAVES_PER_DAY).toBeGreaterThan(0);
  });
});

describe('Wave Type Validation', () => {
  it('should accept valid wave types', () => {
    const validTypes: WaveType[] = ['sent', 'received', 'mutual'];
    validTypes.forEach(type => {
      expect(['sent', 'received', 'mutual']).toContain(type);
    });
  });

  it('should accept valid wave statuses', () => {
    const validStatuses: WaveStatus[] = ['pending', 'accepted', 'declined', 'expired'];
    validStatuses.forEach(status => {
      expect(['pending', 'accepted', 'declined', 'expired']).toContain(status);
    });
  });
});

describe('Wave Date Handling', () => {
  const testWave: Wave = {
    id: 'test-wave-1',
    fromUserId: 'user-1',
    toUserId: 'user-2',
    type: 'sent',
    status: 'pending',
    message: 'Hello!',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('should correctly calculate expiry date', () => {
    const now = new Date();
    const expiryDate = new Date(now.getTime() + WAVE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const wave: Wave = {
      ...testWave,
      expiresAt: expiryDate.toISOString(),
    };

    expect(isWaveExpired(wave)).toBe(false);
  });

  it('should handle invalid date strings gracefully', () => {
    const invalidWave: Wave = {
      ...testWave,
      expiresAt: 'invalid-date',
    };

    // Should not throw an error
    expect(() => isWaveExpired(invalidWave)).not.toThrow();
  });
});