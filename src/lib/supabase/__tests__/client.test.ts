import { invokeEdgeFunction } from '../client';
import type { EdgeFunctionResult } from '../client';

// ── Mock @supabase/ssr at the module level ──────────────────────
// This ensures createBrowserClient returns a stub even when the real
// invokeEdgeFunction calls createClient() internally via its closure.

const mockInvoke = jest.fn();

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    functions: { invoke: mockInvoke },
  })),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// ── Happy path ────────────────────────────────────────────────

describe('invokeEdgeFunction', () => {
  it('returns data on successful invocation', async () => {
    mockInvoke.mockResolvedValue({ data: { matches: [] }, error: null });

    const result = await invokeEdgeFunction('test-fn', { user_id: 'u1' });

    expect(result).toEqual<EdgeFunctionResult<unknown>>({
      data: { matches: [] },
      error: null,
    });
    expect(mockInvoke).toHaveBeenCalledWith('test-fn', {
      body: { user_id: 'u1' },
      signal: expect.any(AbortSignal),
    });
  });

  it('returns data as null when edge function returns null', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: null });

    const result = await invokeEdgeFunction('test-fn', {});

    expect(result.data).toBeNull();
    expect(result.error).toBeNull();
  });

  // ── 4xx client errors — no retry ────────────────────────────

  it('returns immediately on 4xx client error without retrying', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'Bad Request', context: { status: 400 } },
    });

    const result = await invokeEdgeFunction('test-fn', {});

    expect(result.error).toEqual({
      message: 'Bad Request',
      status: 400,
      code: '400',
    });
    expect(mockInvoke).toHaveBeenCalledTimes(1);
  });

  it('returns immediately on 404 without retrying', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'Not Found', context: { status: 404 } },
    });

    const result = await invokeEdgeFunction('test-fn', {});

    expect(result.error?.status).toBe(404);
    expect(mockInvoke).toHaveBeenCalledTimes(1);
  });

  // ── 5xx server errors — retries with backoff ────────────────

  it('retries on 5xx server error', async () => {
    mockInvoke
      .mockRejectedValueOnce(new Error('Network failure'))
      .mockResolvedValueOnce({ data: { ok: true }, error: null });

    const result = await invokeEdgeFunction('test-fn', {});

    expect(result.data).toEqual({ ok: true });
    expect(result.error).toBeNull();
    expect(mockInvoke).toHaveBeenCalledTimes(2);
  });

  it('returns last error after exhausting retries', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'Internal Server Error', context: { status: 500 } },
    });

    const result = await invokeEdgeFunction('test-fn', {});

    expect(result.error?.message).toBe('Internal Server Error');
    // MAX_RETRIES = 2, so 3 attempts total (0, 1, 2)
    expect(mockInvoke).toHaveBeenCalledTimes(3);
  });

  // ── Network / timeout errors ────────────────────────────────

  it('handles AbortError as timeout', async () => {
    const abortError = new DOMException('The operation was aborted', 'AbortError');
    mockInvoke.mockRejectedValue(abortError);

    const result = await invokeEdgeFunction('test-fn', {}, { timeoutMs: 5000 });

    expect(result.error?.code).toBe('TIMEOUT');
    expect(result.error?.message).toContain('timed out');
  });

  it('handles generic network errors', async () => {
    mockInvoke.mockRejectedValue(new Error('Connection refused'));

    const result = await invokeEdgeFunction('test-fn', {});

    expect(result.error?.message).toBe('Connection refused');
    expect(result.error?.code).toBe('FETCH_ERROR');
  });

  // ── Error message extraction ────────────────────────────────

  it('extracts message from error objects with message property', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'Custom error text' },
    });

    const result = await invokeEdgeFunction('test-fn', {});

    expect(result.error?.message).toBe('Custom error text');
  });

  it('returns default message for errors without message property', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: 'string-error',
    });

    const result = await invokeEdgeFunction('test-fn', {});

    expect(result.error?.message).toBe('Edge function error');
  });

  // ── Custom timeout ──────────────────────────────────────────

  it('uses default 30s timeout when no options provided', async () => {
    mockInvoke.mockResolvedValue({ data: 'ok', error: null });

    await invokeEdgeFunction('test-fn', {});

    const signal = mockInvoke.mock.calls[0][1].signal;
    expect(signal).toBeInstanceOf(AbortSignal);
  });

  it('uses custom timeout when provided', async () => {
    mockInvoke.mockResolvedValue({ data: 'ok', error: null });

    await invokeEdgeFunction('test-fn', {}, { timeoutMs: 5000 });

    expect(mockInvoke).toHaveBeenCalled();
  });
});
