import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiRequestError } from '@/shared/api/errors'

const mutateAsync = vi.hoisted(() =>
  vi.fn<(trackId: string) => Promise<void>>(),
)

vi.mock('@entities/History', () => ({
  useRecordListeningHistory: () => ({ mutateAsync }),
}))

import {
  RECORD_RETRY_DELAY_MS,
  useRecordListenedTrack,
} from './useRecordListenedTrack'

const START = new Date('2026-10-16T10:00:00.000Z').getTime()

const renderAt = (currentTime: number, trackId = 'track-1') =>
  renderHook(
    ({ currentTime, trackId }) =>
      useRecordListenedTrack({ currentTime, trackId }),
    { initialProps: { currentTime, trackId } },
  )

/** Lets the rejected request settle before the next playback tick. */
const settle = () => act(async () => undefined)

describe('useRecordListenedTrack', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    vi.useFakeTimers({ now: START, toFake: ['Date'] })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps one request pending while playback keeps ticking', async () => {
    mutateAsync.mockImplementation(() => new Promise<void>(() => undefined))
    const { rerender } = renderAt(15)

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce())
    rerender({ currentTime: 16, trackId: 'track-1' })
    rerender({ currentTime: 17, trackId: 'track-1' })

    expect(mutateAsync).toHaveBeenCalledOnce()
  })

  it('waits before retrying a failed request instead of retrying on every tick', async () => {
    mutateAsync
      .mockRejectedValueOnce(new ApiRequestError('Too Many Requests', 429))
      .mockResolvedValue(undefined)
    const { rerender } = renderAt(15)
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce())
    await settle()

    for (const currentTime of [16, 17, 18, 19])
      rerender({ currentTime, trackId: 'track-1' })
    expect(mutateAsync).toHaveBeenCalledOnce()

    vi.setSystemTime(START + RECORD_RETRY_DELAY_MS)
    rerender({ currentTime: 20, trackId: 'track-1' })
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(2))
  })

  it('gives up on a track after three failed attempts', async () => {
    mutateAsync.mockRejectedValue(new Error('temporary outage'))
    const { rerender } = renderAt(15)

    for (let attempt = 1; attempt <= 4; attempt += 1) {
      await settle()
      vi.setSystemTime(START + attempt * RECORD_RETRY_DELAY_MS)
      rerender({ currentTime: 15 + attempt, trackId: 'track-1' })
    }
    await settle()

    expect(mutateAsync).toHaveBeenCalledTimes(3)
  })

  it('does not retry a request the API refused for good', async () => {
    mutateAsync.mockRejectedValue(new ApiRequestError('Track not found', 404))
    const { rerender } = renderAt(15)
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce())
    await settle()

    vi.setSystemTime(START + RECORD_RETRY_DELAY_MS * 2)
    rerender({ currentTime: 30, trackId: 'track-1' })
    await settle()

    expect(mutateAsync).toHaveBeenCalledOnce()
  })

  it('records a successful track only once when it is revisited', async () => {
    mutateAsync.mockResolvedValue(undefined)
    const { rerender } = renderAt(15)

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce())
    rerender({ currentTime: 15, trackId: 'track-2' })
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(2))
    rerender({ currentTime: 20, trackId: 'track-1' })

    expect(mutateAsync).toHaveBeenCalledTimes(2)
  })
})
