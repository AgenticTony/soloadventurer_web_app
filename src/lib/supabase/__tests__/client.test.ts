import { invokeEdgeFunction } from '../client';
import type { EdgeFunctionResult } from '../client';

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('invokeEdgeFunction', () => {
  it('returns data on successful invocation', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ matches: [] }),
    });

    const result = await invokeEdgeFunction('test-fn', { user_id: 'u1' });

    expect(result).toEqual<EdgeFunctionResult<unknown>>({
      data: { matches: [] },
      error: null,
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/edge/test-fn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'u1' }),
      signal: expect.any(AbortSignal),
    });
  });

  it('returns data as null when edge function returns null', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null),
    });

    const result = await invokeEdgeFunction('test-fn', {});

    expect(result.data).toBeNull();
    expect(result.error).toBeNull();
  });

  // ── 4xx client errors — no retry ────────────────────────────

  it('returns immediately on 4xx client error without retrying', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Bad Request' }),
    });

    const result = await invokeEdgeFunction('test-fn', {});

    expect(result.error).toEqual({
      message: 'Bad Request',
      status: 400,
      code: '400',
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('returns immediately on 404 without retrying', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not Found' }),
    });

    const result = await invokeEdgeFunction('test-fn', {});

    expect(result.error?.status).toBe(404);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  // ── 5xx server errors — retries with backoff ────────────────

  it('retries on 5xx server error and succeeds', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      });

    const result = await invokeEdgeFunction('test-fn', {});

    expect(result.data).toEqual({ ok: true });
    expect(result.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('retries on network failure and succeeds', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network failure'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      });

    const result = await invokeEdgeFunction('test-fn', {});

    expect(result.data).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('returns last error after exhausting retries', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });

    const result = await invokeEdgeFunction('test-fn', {});

    expect(result.error?.status).toBe(500);
    // MAX_RETRIES = 2, so 3 attempts total (0, 1, 2)
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  // ── Network / timeout errors ───────────────────────────────

  it('handles AbortError as timeout', async () => {
    const abortError = new DOMException('The operation was aborted', 'AbortError');
    mockFetch.mockRejectedValue(abortError);

    const result = await invokeEdgeFunction('test-fn', {}, { timeoutMs: 5000 });

    expect(result.error?.code).toBe('TIMEOUT');
    expect(result.error?.message).toContain('timed out');
  });

  it('handles generic network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Connection refused'));

    const result = await invokeEdgeFunction('test-fn', {});

    expect(result.error?.message).toBe('Connection refused');
    expect(result.error?.code).toBe('FETCH_ERROR');
  });

  // ── Error response body extraction ─────────────────────────

  it('extracts message from error response body', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Custom error text' }),
    });

    const result = await invokeEdgeFunction('test-fn', {});

    expect(result.error?.message).toBe('Custom error text');
  });

  it('falls back to status-based message when body has no error field', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });

    const result = await invokeEdgeFunction('test-fn', {});

    expect(result.error?.message).toContain('returned 500');
  });

  // ── Custom timeout ─────────────────────────────────────────

  it('passes AbortSignal to fetch', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve('ok'),
    });

    await invokeEdgeFunction('test-fn', {});

    const opts = mockFetch.mock.calls[0][1];
    expect(opts.signal).toBeInstanceOf(AbortSignal);
  });
});
