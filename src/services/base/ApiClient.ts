import { createClient } from '@/lib/supabase/client';
import { AppError } from '@/lib/errors';

// Backward-compatible alias
export type ApiError = AppError;
export const ApiError = AppError;

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig = {}) {
    this.baseURL = config.baseURL || '';
    this.timeout = config.timeout || 10000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token ?? null;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  private async getApiEndpoint(): Promise<string> {
    if (this.baseURL) {
      return this.baseURL;
    }

    const envEndpoint = process.env.NEXT_PUBLIC_API_BASE;
    if (envEndpoint) {
      return envEndpoint;
    }

    throw new ApiError('API endpoint not configured');
  }

  async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      body?: unknown;
      headers?: Record<string, string>;
      requireAuth?: boolean;
    } = {}
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      requireAuth = true,
    } = options;

    try {
      const baseURL = await this.getApiEndpoint();
      const url = `${baseURL}${endpoint}`;

      const requestHeaders = {
        ...this.defaultHeaders,
        ...headers,
      };

      if (requireAuth) {
        const token = await this.getAuthToken();
        if (!token) {
          throw new ApiError('User not authenticated', 401);
        }
        requestHeaders.Authorization = `Bearer ${token}`;
      }

      const requestInit: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (body && method !== 'GET') {
        requestInit.body = JSON.stringify(body);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(url, {
          ...requestInit,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            error: 'Request failed',
          }));

          throw new ApiError(
            errorData.error || `HTTP ${response.status}`,
            response.status,
            errorData.details
          );
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        }

        return {} as T;
      } catch (error: unknown) {
        clearTimeout(timeoutId);

        const err = error as Error;
        if (err.name === 'AbortError') {
          throw new ApiError('Request timeout', 408);
        }

        throw error;
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error('API request failed:', error);
      throw new ApiError('Network request failed');
    }
  }

  async get<T>(endpoint: string, options?: { headers?: Record<string, string>; requireAuth?: boolean }): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: { headers?: Record<string, string>; requireAuth?: boolean }
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, ...options });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: { headers?: Record<string, string>; requireAuth?: boolean }
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, ...options });
  }

  async delete<T>(
    endpoint: string,
    options?: { headers?: Record<string, string>; requireAuth?: boolean }
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options });
  }
}

// Singleton instance
export const apiClient = new ApiClient();
