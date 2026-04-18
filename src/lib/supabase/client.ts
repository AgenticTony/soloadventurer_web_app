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
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  let lastError: EdgeFunctionResult<T>['error'];

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Route through Next.js API proxy to avoid CORS issues from browser
      const res = await fetch(`/api/edge/${functionName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = (body as Record<string, unknown>)?.error
          ? String((body as Record<string, unknown>).error)
          : `Edge function "${functionName}" returned ${res.status}`;
        const status = res.status;

        // 4xx = client error — do not retry
        if (status >= 400 && status < 500) {
          return { data: null, error: { message, status, code: String(status) } };
        }

        lastError = { message, status };
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
          continue;
        }
        return { data: null, error: lastError };
      }

      const data = (await res.json()) as T;
      return { data, error: null };
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

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
        continue;
      }
      return { data: null, error: lastError };
    }
  }

  return { data: null, error: lastError! };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
