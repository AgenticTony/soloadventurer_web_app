'use client'

import { useState, useEffect, useCallback } from 'react'
import type { GeolocationState, UserLocation } from '@/types/map'

export function useUserLocation(): GeolocationState & { requestLocation: () => void } {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: false,
    permission: 'prompt',
  })

  const checkGeolocationSupport = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        permission: 'unsupported',
      }))
      return false
    }
    return true
  }, [])

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    console.log('Location success:', position.coords)

    const location: UserLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    }

    setState({
      location,
      error: null,
      loading: false,
      permission: 'granted',
    })
  }, [])

  const handleError = useCallback((error: GeolocationPositionError) => {
    console.log('Location error:', error.code, error.message)

    let errorMessage: string
    let permission: GeolocationState['permission'] = 'denied'

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied by user'
        permission = 'denied'
        break
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable'
        permission = 'denied'
        break
      case error.TIMEOUT:
        errorMessage = 'Location request timed out'
        permission = 'granted'
        break
      default:
        errorMessage = 'An unknown error occurred while retrieving location'
        permission = 'denied'
        break
    }

    setState({
      location: null,
      error: errorMessage,
      loading: false,
      permission,
    })
  }, [])

  const requestLocation = useCallback(() => {
    console.log('requestLocation called')

    if (!checkGeolocationSupport()) {
      console.log('Geolocation not supported')
      return
    }

    console.log('Setting loading state')
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }))

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    }

    console.log('Calling navigator.geolocation.getCurrentPosition')
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options)
  }, [checkGeolocationSupport, handleSuccess, handleError])

  useEffect(() => {
    checkGeolocationSupport()
  }, [checkGeolocationSupport])

  return {
    ...state,
    requestLocation,
  }
}
