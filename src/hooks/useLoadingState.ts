'use client'

import { useState, useCallback } from 'react'

export interface LoadingState<T = unknown> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useLoadingState<T = unknown>() {
  const [state, setState] = useState<LoadingState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading, error: loading ? null : prev.error }))
  }, [])

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data, loading: false, error: null }))
  }, [])

  const setError = useCallback((error: Error | string) => {
    setState(prev => ({
      ...prev,
      error: error instanceof Error ? error : new Error(error),
      loading: false,
    }))
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  const execute = useCallback(
    async <R = unknown>(
      asyncFn: () => Promise<R>,
      onSuccess?: (data: R) => void,
      onError?: (error: Error) => void
    ) => {
      setLoading(true)
      try {
        const result = await asyncFn()
        setData(result as T)
        onSuccess?.(result)
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        setError(err)
        onError?.(err)
        throw err
      }
    },
    [setLoading, setData, setError]
  )

  return {
    ...state,
    setLoading,
    setData,
    setError,
    reset,
    execute,
  }
}

// Hook for paginated data with loading states
export interface PaginatedState<T> {
  data: T[]
  loading: boolean
  error: Error | null
  hasMore: boolean
  page: number
  total: number
}

export function usePaginatedState<T = unknown>(initialPage = 1) {
  const [state, setState] = useState<PaginatedState<T>>({
    data: [],
    loading: false,
    error: null,
    hasMore: true,
    page: initialPage,
    total: 0,
  })

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading, error: loading ? null : prev.error }))
  }, [])

  const appendData = useCallback((newData: T[], hasMore: boolean, total: number) => {
    setState(prev => ({
      ...prev,
      data: [...prev.data, ...newData],
      loading: false,
      error: null,
      hasMore,
      total,
    }))
  }, [])

  const setData = useCallback((data: T[], hasMore: boolean, total: number) => {
    setState(prev => ({
      ...prev,
      data,
      loading: false,
      error: null,
      hasMore,
      total,
    }))
  }, [])

  const setError = useCallback((error: Error | string) => {
    setState(prev => ({
      ...prev,
      error: error instanceof Error ? error : new Error(error),
      loading: false,
    }))
  }, [])

  const nextPage = useCallback(() => {
    setState(prev => ({ ...prev, page: prev.page + 1 }))
  }, [])

  const reset = useCallback(() => {
    setState({
      data: [],
      loading: false,
      error: null,
      hasMore: true,
      page: initialPage,
      total: 0,
    })
  }, [initialPage])

  const loadMore = useCallback(
    async (asyncFn: (page: number) => Promise<{ data: T[]; hasMore: boolean; total: number }>) => {
      if (state.loading || !state.hasMore) return

      setLoading(true)
      try {
        const result = await asyncFn(state.page)
        appendData(result.data, result.hasMore, result.total)
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        setError(err)
        throw err
      }
    },
    [state.loading, state.hasMore, state.page, setLoading, appendData, setError]
  )

  const refresh = useCallback(
    async (asyncFn: (page: number) => Promise<{ data: T[]; hasMore: boolean; total: number }>) => {
      reset()
      setLoading(true)
      try {
        const result = await asyncFn(initialPage)
        setData(result.data, result.hasMore, result.total)
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        setError(err)
        throw err
      }
    },
    [reset, setLoading, setData, setError, initialPage]
  )

  return {
    ...state,
    setLoading,
    setData,
    appendData,
    setError,
    nextPage,
    reset,
    loadMore,
    refresh,
  }
}
