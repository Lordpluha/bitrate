import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mutateAsync = vi.hoisted(() =>
  vi.fn<(trackId: string) => Promise<void>>(),
)

vi.mock('@entities/History', () => ({
  useRecordListeningHistory: () => ({ mutateAsync }),
}))

import { useRecordListenedTrack } from './useRecordListenedTrack'

describe('useRecordListenedTrack', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
  })

  it('keeps one request pending and retries after a transient failure', async () => {
    let rejectFirst: (reason: Error) => void = () => undefined
    mutateAsync
      .mockImplementationOnce(
        () =>
          new Promise<void>((_resolve, reject) => {
            rejectFirst = reject
          }),
      )
      .mockResolvedValue(undefined)

    const { rerender } = renderHook(
      ({ currentTime }) =>
        useRecordListenedTrack({ currentTime, trackId: 'track-1' }),
      { initialProps: { currentTime: 15 } },
    )

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce())
    rerender({ currentTime: 16 })
    expect(mutateAsync).toHaveBeenCalledOnce()

    await act(async () => rejectFirst(new Error('temporary outage')))
    rerender({ currentTime: 17 })
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(2))

    rerender({ currentTime: 18 })
    expect(mutateAsync).toHaveBeenCalledTimes(2)
  })

  it('records a successful track only once when it is revisited', async () => {
    mutateAsync.mockResolvedValue(undefined)
    const { rerender } = renderHook(
      ({ currentTime, trackId }) =>
        useRecordListenedTrack({ currentTime, trackId }),
      { initialProps: { currentTime: 15, trackId: 'track-1' } },
    )

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce())
    rerender({ currentTime: 15, trackId: 'track-2' })
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(2))
    rerender({ currentTime: 20, trackId: 'track-1' })

    expect(mutateAsync).toHaveBeenCalledTimes(2)
  })
})
