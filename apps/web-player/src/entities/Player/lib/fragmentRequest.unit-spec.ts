import { afterEach, describe, expect, it, vi } from 'vitest'
import { type RequestFragmentInput, requestFragment } from './fragmentRequest'

/**
 * Characterises the retry contract the CMAF loader depends on, so moving it into
 * `@bitrate/player` cannot change it unnoticed: `null` means superseded, a throw
 * means the budget is spent or the failure is final.
 */
const RETRY = { baseDelayMs: 0, maxAttempts: 3, timeoutMs: 1_000 }

const statusError = (status: number) =>
  Object.assign(new Error(`HTTP ${status}`), { status })

const input = (
  overrides: Partial<RequestFragmentInput>,
): RequestFragmentInput => ({
  bitrate: 128,
  fetchRange: vi.fn(async () => new ArrayBuffer(4)),
  isCurrent: () => true,
  onRequestEnd: vi.fn(),
  onRequestStart: vi.fn(),
  range: [0, 3],
  retry: RETRY,
  ...overrides,
})

describe('requestFragment', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the bytes and reports one throughput sample', async () => {
    const onSample = vi.fn()
    const bytes = await requestFragment(input({ onSample }))

    expect(bytes?.byteLength).toBe(4)
    expect(onSample).toHaveBeenCalledWith(expect.objectContaining({ bytes: 4 }))
  })

  it('retries 408, 429 and 5xx, then succeeds within the budget', async () => {
    const fetchRange = vi
      .fn<RequestFragmentInput['fetchRange']>()
      .mockRejectedValueOnce(statusError(503))
      .mockRejectedValueOnce(statusError(429))
      .mockResolvedValue(new ArrayBuffer(2))

    const bytes = await requestFragment(input({ fetchRange }))

    expect(bytes?.byteLength).toBe(2)
    expect(fetchRange).toHaveBeenCalledTimes(3)
  })

  it('throws at once on a non-retryable 4xx', async () => {
    const fetchRange = vi
      .fn<RequestFragmentInput['fetchRange']>()
      .mockRejectedValue(statusError(404))

    await expect(requestFragment(input({ fetchRange }))).rejects.toThrow(
      'HTTP 404',
    )
    expect(fetchRange).toHaveBeenCalledTimes(1)
  })

  it('throws once every attempt has failed', async () => {
    const fetchRange = vi
      .fn<RequestFragmentInput['fetchRange']>()
      .mockRejectedValue(new Error('offline'))

    await expect(requestFragment(input({ fetchRange }))).rejects.toThrow(
      'offline',
    )
    expect(fetchRange).toHaveBeenCalledTimes(3)
  })

  it('returns null without fetching once a seek has superseded it', async () => {
    const fetchRange = vi.fn<RequestFragmentInput['fetchRange']>()

    const bytes = await requestFragment(
      input({ fetchRange, isCurrent: () => false }),
    )

    expect(bytes).toBeNull()
    expect(fetchRange).not.toHaveBeenCalled()
  })

  it('returns null when its controller is aborted from outside', async () => {
    const fetchRange = vi.fn<RequestFragmentInput['fetchRange']>(
      () => new Promise<ArrayBuffer>(() => undefined),
    )

    const pending = requestFragment(
      input({
        fetchRange,
        onRequestStart: (controller) => {
          queueMicrotask(() => controller.abort())
        },
      }),
    )

    await expect(pending).resolves.toBeNull()
  })

  it('treats a timed-out attempt as retryable and reports the timeout last', async () => {
    vi.useFakeTimers()
    const fetchRange = vi.fn<RequestFragmentInput['fetchRange']>(
      () => new Promise<ArrayBuffer>(() => undefined),
    )

    const pending = requestFragment(
      input({ fetchRange, retry: { ...RETRY, maxAttempts: 2 } }),
    )
    const settled = expect(pending).rejects.toThrow('timed out')
    await vi.advanceTimersByTimeAsync(RETRY.timeoutMs * 3)

    await settled
    expect(fetchRange).toHaveBeenCalledTimes(2)
  })
})
