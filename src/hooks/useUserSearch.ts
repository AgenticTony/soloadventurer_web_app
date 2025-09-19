'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '@/services/users/types';
import type { UserGeolocationPosition } from './useGeolocation';
import { userService } from '@/services/users/userService';

export interface UserSearchFilters {
  query: string;
  location: UserGeolocationPosition | null;
  radiusKm: number;
  interests: string[];
}

export interface UseUserSearchState {
  users: UserProfile[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  totalCount: number;
}

export interface UseUserSearchReturn extends UseUserSearchState {
  filters: UserSearchFilters;
  searchHistory: string[];
  setQuery: (query: string) => void;
  setLocation: (location: UserGeolocationPosition | null) => void;
  setRadiusKm: (radius: number) => void;
  setInterests: (interests: string[]) => void;
  loadMore: () => void;
  refresh: () => void;
  clearHistory: () => void;
}

const SEARCH_HISTORY_KEY = 'user_search_history';
const MAX_HISTORY_ITEMS = 10;

function saveSearchHistory(query: string) {
  if (!query.trim()) return;

  try {
    const history = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]') as string[];
    const newHistory = [query, ...history.filter(h => h !== query)].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.warn('Failed to save search history:', error);
  }
}

function loadSearchHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]') as string[];
  } catch (error) {
    console.warn('Failed to load search history:', error);
    return [];
  }
}

export function useUserSearch(): UseUserSearchReturn {
  const [state, setState] = useState<UseUserSearchState>({
    users: [],
    loading: false,
    error: null,
    hasMore: true,
    page: 0,
    totalCount: 0,
  });

  const [filters, setFilters] = useState<UserSearchFilters>({
    query: '',
    location: null,
    radiusKm: 10,
    interests: [],
  });

  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history on mount
  useEffect(() => {
    setSearchHistory(loadSearchHistory());
  }, []);

  const performSearch = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      page: 0,
      users: []
    }));

    try {
      // Save search query to history
      if (filters.query.trim()) {
        saveSearchHistory(filters.query);
        setSearchHistory(loadSearchHistory());
      }

      // Call the userService for search
      const users = await userService.searchUsers(
        filters.query || '',
        { limit: 12, offset: 0 }
      );

      setState(prev => ({
        ...prev,
        users: users,
        loading: false,
        hasMore: users.length === 12, // Simple check for pagination
        totalCount: users.length,
        page: 0
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to search users',
      }));
    }
  }, [filters]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [performSearch]);

  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.loading) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const nextPage = state.page + 1;

      // Call the userService for next page
      const users = await userService.searchUsers(
        filters.query || '',
        { limit: 12, offset: nextPage * 12 }
      );

      setState(prev => ({
        ...prev,
        users: [...prev.users, ...users],
        loading: false,
        page: nextPage,
        hasMore: users.length === 12,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load more users',
      }));
    }
  }, [state.hasMore, state.loading, state.page, filters]);

  const refresh = useCallback(() => {
    performSearch();
  }, [performSearch]);

  const setQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, query }));
  }, []);

  const setLocation = useCallback((location: UserGeolocationPosition | null) => {
    setFilters(prev => ({ ...prev, location }));
  }, []);

  const setRadiusKm = useCallback((radiusKm: number) => {
    setFilters(prev => ({ ...prev, radiusKm }));
  }, []);

  const setInterests = useCallback((interests: string[]) => {
    setFilters(prev => ({ ...prev, interests }));
  }, []);

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
      setSearchHistory([]);
    } catch (error) {
      console.warn('Failed to clear search history:', error);
    }
  }, []);

  return {
    ...state,
    filters,
    searchHistory,
    setQuery,
    setLocation,
    setRadiusKm,
    setInterests,
    loadMore,
    refresh,
    clearHistory,
  };
}