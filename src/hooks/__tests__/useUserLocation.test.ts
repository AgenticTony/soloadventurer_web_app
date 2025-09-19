import { renderHook, act } from '@testing-library/react';
import { useUserLocation } from '../useUserLocation';

const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

describe('useUserLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useUserLocation());

    expect(result.current.location).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.permission).toBe('prompt');
    expect(typeof result.current.requestLocation).toBe('function');
  });

  it('should handle successful location request', async () => {
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
      },
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      setTimeout(() => success(mockPosition), 0);
    });

    const { result } = renderHook(() => useUserLocation());

    act(() => {
      result.current.requestLocation();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.location).toEqual({
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 10,
    });
    expect(result.current.error).toBeNull();
    expect(result.current.permission).toBe('granted');
  });

  it('should handle permission denied error', async () => {
    const mockError = {
      code: 1, // PERMISSION_DENIED
      message: 'User denied geolocation',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      setTimeout(() => error(mockError), 0);
    });

    const { result } = renderHook(() => useUserLocation());

    act(() => {
      result.current.requestLocation();
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.location).toBeNull();
    expect(result.current.error).toBe('Location access denied by user');
    expect(result.current.permission).toBe('denied');
  });

  it('should handle position unavailable error', async () => {
    const mockError = {
      code: 2, // POSITION_UNAVAILABLE
      message: 'Position unavailable',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      setTimeout(() => error(mockError), 0);
    });

    const { result } = renderHook(() => useUserLocation());

    act(() => {
      result.current.requestLocation();
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe('Location information is unavailable');
    expect(result.current.permission).toBe('denied');
  });

  it('should handle timeout error', async () => {
    const mockError = {
      code: 3, // TIMEOUT
      message: 'Timeout',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      setTimeout(() => error(mockError), 0);
    });

    const { result } = renderHook(() => useUserLocation());

    act(() => {
      result.current.requestLocation();
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe('Location request timed out');
    expect(result.current.permission).toBe('granted'); // timeout means permission was granted but failed
  });

  it('should handle unsupported geolocation', () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      writable: true,
    });

    const { result } = renderHook(() => useUserLocation());

    expect(result.current.permission).toBe('unsupported');
    expect(result.current.error).toBe('Geolocation is not supported by this browser');

    act(() => {
      result.current.requestLocation();
    });

    expect(mockGeolocation.getCurrentPosition).not.toHaveBeenCalled();
  });

  it('should call getCurrentPosition with correct options', () => {
    const { result } = renderHook(() => useUserLocation());

    act(() => {
      result.current.requestLocation();
    });

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  });
});