import type {
  BitratePlayerElement,
  BitratePlayerSource,
} from '@bitrate/player/contract'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { TrackEntity } from '@/entities/Track/models/schema/Track.entity'

const { showApiErrorToast } = vi.hoisted(() => ({
  showApiErrorToast: vi.fn(),
}))
vi.mock('@/shared/api/feedback', () => ({ showApiErrorToast }))

import { usePlayerStore } from './playerStore'
import { useStreamingPlayer } from './useStreamingPlayer'

/**
 * The store ↔ element binding: the store decides what plays, the element plays it and reports
 * back. The element is a scripted stand-in — its own behaviour is covered in `@bitrate/player`.
 */
const createTrack = (id: string): TrackEntity => ({
  id,
  title: id,
  duration: 200,
  artistId: 'artist-id',
  audioUrl: `/audio/${id}.mp3`,
  cover: '/cover.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  releaseDate: null,
  lyrics: null,
  processingStatus: 'READY' as const,
  processingError: null,
  processingAttempts: 0,
  processingStartedAt: null,
  processingFinishedAt: null,
  explicit: false,
  popularity: 0,
  playCount: 0,
  isrc: null,
  previewUrl: null,
  trackNumber: null,
  discNumber: 1,
  language: null,
  deletedAt: null,
  fragmentTimescale: null,
  durationTicks: null,
  publishedAt: '2026-01-01T00:00:00.000Z',
})

type FakeElement = EventTarget & {
  streaming: unknown
  source: BitratePlayerSource | null
  next: BitratePlayerSource | null
  volume: number
  play: ReturnType<typeof vi.fn>
  pause: ReturnType<typeof vi.fn>
  seek: ReturnType<typeof vi.fn>
}

const fakeElement = (): FakeElement =>
  Object.assign(new EventTarget(), {
    next: null,
    pause: vi.fn(),
    play: vi.fn(async () => undefined),
    seek: vi.fn(),
    source: null,
    streaming: null,
    volume: 1,
  })

const emit = (element: FakeElement, type: string, detail?: unknown) => {
  act(() => {
    element.dispatchEvent(new CustomEvent(type, { detail }))
  })
}

const renderPlayer = () => {
  const client = new QueryClient()
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  const view = renderHook(() => useStreamingPlayer(), { wrapper })
  const element = fakeElement()
  act(() => {
    view.result.current.bindElement(element as unknown as BitratePlayerElement)
  })
  return { element, ...view }
}

const startPlaylist = () => {
  const tracks = ['a', 'b'].map(createTrack)
  const [first] = tracks
  if (!first) throw new Error('fixture has no tracks')
  act(() => {
    usePlayerStore.getState().playPlaylist({
      currentPlaylistId: 'p1',
      currentPlaylistName: 'Mix',
      startTrack: first,
      tracks,
    })
  })
}

describe('useStreamingPlayer', () => {
  beforeEach(() => {
    usePlayerStore.getState().reset()
    showApiErrorToast.mockReset()
  })

  it('gives the element the transport, the current play and the one after it', () => {
    const { element } = renderPlayer()
    startPlaylist()

    expect(element.streaming).toMatchObject({
      renditionUrl: expect.any(Function),
    })
    expect(element.streaming).not.toHaveProperty('legacy')
    expect(element.source).toMatchObject({
      key: expect.stringContaining('p1:a:'),
      trackId: 'a',
    })
    expect(element.source).not.toHaveProperty('progressiveUrl')
    expect(element.next).toMatchObject({ trackId: 'b' })
    expect(element.play).toHaveBeenCalled()
  })

  it('pauses the element when the store pauses, and follows the volume', () => {
    const { element } = renderPlayer()
    startPlaylist()

    act(() => {
      usePlayerStore.getState().pause()
      usePlayerStore.getState().setVolume(0.3)
    })

    expect(element.pause).toHaveBeenCalled()
    expect(element.volume).toBe(0.3)
  })

  it('mirrors play, pause and time for the current play into the store', () => {
    const { element } = renderPlayer()
    startPlaylist()
    const key = element.source?.key

    emit(element, 'pause')
    expect(usePlayerStore.getState().isPlaying).toBe(false)
    emit(element, 'play')
    expect(usePlayerStore.getState().isPlaying).toBe(true)

    emit(element, 'statechange', { currentTime: 12, duration: 200, key })
    expect(usePlayerStore.getState().currentTime).toBe(12)

    emit(element, 'statechange', { currentTime: 99, duration: 200, key: 'x' })
    expect(usePlayerStore.getState().currentTime).toBe(12)
  })

  it('keeps a restored position until the element has loaded the track', () => {
    const { element } = renderPlayer()
    startPlaylist()
    act(() => usePlayerStore.getState().setCurrentTime(64))

    emit(element, 'statechange', {
      currentTime: 0,
      duration: 0,
      key: element.source?.key,
    })

    expect(usePlayerStore.getState().currentTime).toBe(64)
  })

  it('moves the store on when the current play ends, so the element switches to next', () => {
    const { element } = renderPlayer()
    startPlaylist()
    const prefetched = element.next?.key

    emit(element, 'ended', { key: element.source?.key })

    expect(usePlayerStore.getState().currentTrack?.id).toBe('b')
    expect(element.source?.key).toBe(prefetched)
  })

  it('ignores the end of a play that is no longer current', () => {
    const { element } = renderPlayer()
    startPlaylist()

    emit(element, 'ended', { key: 'stale' })

    expect(usePlayerStore.getState().currentTrack?.id).toBe('a')
  })

  it('stops at the end of the queue', () => {
    const { element } = renderPlayer()
    startPlaylist()
    emit(element, 'ended', { key: element.source?.key })

    emit(element, 'ended', { key: element.source?.key })

    expect(usePlayerStore.getState().isPlaying).toBe(false)
  })

  it('restarts the play in place when repeat-one is on', () => {
    const { element } = renderPlayer()
    startPlaylist()
    act(() => {
      usePlayerStore.getState().cycleRepeatMode()
      usePlayerStore.getState().cycleRepeatMode()
    })
    expect(usePlayerStore.getState().repeatMode).toBe('one')

    emit(element, 'ended', { key: element.source?.key })

    expect(element.seek).toHaveBeenCalledWith(0)
    expect(usePlayerStore.getState().currentTrack?.id).toBe('a')
  })

  it('pauses and shows the message when the element cannot play the track', () => {
    const { element } = renderPlayer()
    startPlaylist()

    emit(element, 'error', { code: 'playback', message: 'Unable to play' })

    expect(usePlayerStore.getState().isPlaying).toBe(false)
    expect(showApiErrorToast).toHaveBeenCalledWith(new Error('Unable to play'))
  })

  it('seeks the element and the store together', () => {
    const { element, result } = renderPlayer()
    startPlaylist()

    act(() => result.current.onSeek(42))

    expect(element.seek).toHaveBeenCalledWith(42)
    expect(usePlayerStore.getState().currentTime).toBe(42)
  })
})
