import type { PlaybackEventBody } from '@entities/PlaybackEvent'
import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type PostInput = { body: PlaybackEventBody; keepalive?: boolean }

const postPlaybackEvent = vi.hoisted(() =>
  vi.fn<(input: PostInput) => Promise<void>>(async () => undefined),
)

vi.mock('@entities/PlaybackEvent', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  postPlaybackEvent,
}))

import { useReportPlaybackEvents } from './useReportPlaybackEvents'

const TRACK_A = '0199aee0-0000-7000-8000-00000000000a'
const TRACK_B = '0199aee0-0000-7000-8000-00000000000b'
const ALBUM = '0199aee0-0000-7000-8000-0000000000a1'

type Props = Parameters<typeof useReportPlaybackEvents>[0]

const base: Props = {
  trackId: TRACK_A,
  playbackSequence: 1,
  currentPlaylistId: `album:${ALBUM}`,
  currentTime: 0,
  duration: 200,
  isPlaying: true,
}

/** Plays `seconds` of audio in quarter-second ticks, the way the element reports it. */
const playFor = (
  rerender: (props: Props) => void,
  props: Props,
  seconds: number,
) => {
  let current = props
  for (let tick = 1; tick <= seconds * 4; tick += 1) {
    current = { ...current, currentTime: props.currentTime + tick / 4 }
    rerender(current)
  }
  return current
}

const sentBody = (call = 0) => postPlaybackEvent.mock.calls[call]?.[0]

describe('useReportPlaybackEvents', () => {
  beforeEach(() => {
    postPlaybackEvent.mockClear()
    vi.useFakeTimers({
      now: new Date('2026-11-23T10:00:00.000Z'),
      toFake: ['Date'],
    })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('reports a skipped play with its heard time and source when the next track starts', () => {
    const { rerender } = renderHook(
      (props: Props) => useReportPlaybackEvents(props),
      {
        initialProps: base,
      },
    )
    const played = playFor(rerender, base, 10)

    rerender({
      ...played,
      trackId: TRACK_B,
      playbackSequence: 2,
      currentTime: 0,
    })

    expect(postPlaybackEvent).toHaveBeenCalledOnce()
    expect(sentBody()).toEqual({
      body: expect.objectContaining({
        trackId: TRACK_A,
        listenedMs: 10_000,
        endReason: 'SKIPPED',
        source: 'ALBUM',
        sourceId: ALBUM,
      }),
      keepalive: false,
    })
  })

  it('reports a play that reached the end as completed', () => {
    const start = { ...base, currentTime: 195 }
    const { rerender } = renderHook(
      (props: Props) => useReportPlaybackEvents(props),
      {
        initialProps: start,
      },
    )
    const played = playFor(rerender, start, 5)

    rerender({ ...played, isPlaying: false })
    rerender({
      ...played,
      trackId: TRACK_B,
      playbackSequence: 2,
      currentTime: 0,
    })

    expect(sentBody()?.body).toEqual(
      expect.objectContaining({ endReason: 'COMPLETED' }),
    )
  })

  it('does not count a seek as heard audio', () => {
    const { rerender } = renderHook(
      (props: Props) => useReportPlaybackEvents(props),
      {
        initialProps: base,
      },
    )
    const played = playFor(rerender, base, 4)
    rerender({ ...played, currentTime: 150 })
    rerender({
      ...played,
      trackId: TRACK_B,
      playbackSequence: 2,
      currentTime: 0,
    })

    expect(sentBody()?.body).toEqual(
      expect.objectContaining({ listenedMs: 4000 }),
    )
  })

  it('reports the play in progress as stopped, with keepalive, when the page goes away', () => {
    const { rerender } = renderHook(
      (props: Props) => useReportPlaybackEvents(props),
      {
        initialProps: base,
      },
    )
    playFor(rerender, base, 3)

    window.dispatchEvent(new Event('pagehide'))

    expect(sentBody()).toEqual({
      body: expect.objectContaining({ endReason: 'STOPPED', listenedMs: 3000 }),
      keepalive: true,
    })
  })

  it('reports nothing for a track skipped right away', () => {
    const { rerender } = renderHook(
      (props: Props) => useReportPlaybackEvents(props),
      {
        initialProps: base,
      },
    )
    rerender({ ...base, currentTime: 0.25 })
    rerender({ ...base, trackId: TRACK_B, playbackSequence: 2 })

    expect(postPlaybackEvent).not.toHaveBeenCalled()
  })

  it('reports a repeated track as a new play', () => {
    const { rerender } = renderHook(
      (props: Props) => useReportPlaybackEvents(props),
      {
        initialProps: base,
      },
    )
    const played = playFor(rerender, base, 2)
    rerender({ ...played, playbackSequence: 2, currentTime: 0 })

    expect(postPlaybackEvent).toHaveBeenCalledOnce()
  })
})
