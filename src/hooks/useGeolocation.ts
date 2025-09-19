'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UserGeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface UseGeolocationState {
  position: UserGeolocationPosition | null;
  error: string | null;
  loading: boolean;
  permission: 'prompt' | 'granted' | 'denied';
}

export interface UseGeolocationReturn extends UseGeolocationState {
  requestPosition: () => void;
  clearError: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [state, setState] = useState<UseGeolocationState>({
    position: null,
    error: null,
    loading: false,
    permission: 'prompt',
  });

  const watchIdRef = useRef<number | null>(null);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const newPosition: UserGeolocationPosition = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };

    setState(prev => ({
      ...prev,
      position: newPosition,
      error: null,
      loading: false,
      permission: 'granted',
    }));
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage: string;
    let permission: UseGeolocationState['permission'] = 'denied';

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied. Please enable location permissions.';
        permission = 'denied';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable.';
        permission = 'denied';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out.';
        permission = 'granted'; // Permission was granted but request timed out
        break;
      default:
        errorMessage = 'An unknown error occurred while retrieving location.';
        permission = 'denied';
        break;
    }

    setState(prev => ({
      ...prev,
      position: null,
      error: errorMessage,
      loading: false,
      permission,
    }));
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser.',
        permission: 'denied',
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000, // 30 seconds cache
    };

    // Stop any existing watch
    stopWatching();

    // Start watching position with 30-second updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );
  }, [handleSuccess, handleError, stopWatching]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  return {
    ...state,
    requestPosition,
    clearError,
  };
}