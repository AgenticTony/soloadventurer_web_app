import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// ── Edge Function Invoker ──────────────────────────────────────

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 1_000;

export interface EdgeFunctionResult<T> {
  data: T | null;
  error: {
    message: string;
    status?: number;
    code?: string;
  } | null;
}

/**
 * Invoke a Supabase Edge Function with auth, timeout, and retry logic.
 *
 * Retries are only attempted on network/infrastructure errors (5xx, relay,
 * fetch failures). Client errors (4xx) are returned immediately.
 */
export async function invokeEdgeFunction<T = unknown>(
  functionName: string,
  params: Record<string, unknown>,
  options?: { timeoutMs?: number },
): Promise<EdgeFunctionResult<T>> {
  const supabase = createClient();
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  let lastError: EdgeFunctionResult<T>['error'];

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const { data, error } = await supabase.functions.invoke<T>(functionName, {
        body: params,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (error) {
        // Extract status from Supabase FunctionsError shape safely
        const ctx = (error as Record<string, unknown>)?.context;
        const status =
          typeof ctx === 'object' && ctx !== null
            ? (ctx as Record<string, unknown>)?.status
            : undefined;
        const message =
          typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message: unknown }).message)
            : 'Edge function error';

        // 4xx = client error — do not retry
        if (typeof status === 'number' && status >= 400 && status < 500) {
          return {
            data: null,
            error: { message, status, code: String(status) },
          };
        }

        lastError = { message, status: typeof status === 'number' ? status : undefined };
        // 5xx / relay / fetch errors — retry with backoff
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
          continue;
        }
        // Retries exhausted — return the last server error
        return { data: null, error: lastError };
      }

      return { data: data ?? null, error: null };
    } catch (err) {
      clearTimeout(timeoutId);

      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      lastError = {
        message: isAbort
          ? `Edge function "${functionName}" timed out after ${timeoutMs}ms`
          : err instanceof Error
            ? err.message
            : 'Unknown error invoking edge function',
        code: isAbort ? 'TIMEOUT' : 'FETCH_ERROR',
      };

      // Timeout or network error — retry
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
        continue;
      }
      // Retries exhausted — return the last network error
      return { data: null, error: lastError };
    }
  }

  return { data: null, error: lastError! };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
