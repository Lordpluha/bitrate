import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const player = vi.hoisted(() => ({ play: vi.fn(), playPlaylist: vi.fn() }))
const remote = vi.hoisted(() => ({
  album: vi.fn(),
  playlist: vi.fn(),
  track: vi.fn(),
}))

vi.mock('@entities/Player', () => ({
  usePlayerStore: (select: (state: typeof player) => unknown) => select(player),
}))
vi.mock('@entities/Album', () => ({
  albumDetailQuery: (id: string) => ({
    queryFn: () => remote.album(id),
    queryKey: ['album', id],
  }),
}))
vi.mock('@entities/Playlist', () => ({
  playlistDetailQuery: (id: string) => ({
    queryFn: () => remote.playlist(id),
    queryKey: ['playlist', id],
  }),
}))
vi.mock('@entities/Track', () => ({ getTrackById: remote.track }))
vi.mock('@shared/api/feedback', () => ({ showApiErrorToast: vi.fn() }))

import { showApiErrorToast } from '@shared/api/feedback'
import { usePlayCollection } from './usePlayCollection'

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
)

const tracks = [{ id: 't1' }, { id: 't2' }]

describe('usePlayCollection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts an album from its first track in the album playback context', async () => {
    remote.album.mockResolvedValue({ tracks })
    const { result } = renderHook(() => usePlayCollection(), { wrapper })

    await act(() =>
      result.current({ id: 'a1', kind: 'album', title: 'Afterglow' }),
    )

    expect(player.playPlaylist).toHaveBeenCalledWith({
      currentPlaylistId: 'album:a1',
      currentPlaylistName: 'Afterglow',
      startTrack: tracks[0],
      startTrackIndex: 0,
      tracks,
    })
  })

  it('starts a playlist in its own playback context', async () => {
    remote.playlist.mockResolvedValue({ tracks })
    const { result } = renderHook(() => usePlayCollection(), { wrapper })

    await act(() =>
      result.current({ id: 'p1', kind: 'playlist', title: 'Night Drive' }),
    )

    expect(player.playPlaylist).toHaveBeenCalledWith(
      expect.objectContaining({
        currentPlaylistId: 'p1',
        startTrack: tracks[0],
      }),
    )
  })

  it('does nothing for an empty collection', async () => {
    remote.album.mockResolvedValue({ tracks: [] })
    const { result } = renderHook(() => usePlayCollection(), { wrapper })

    await act(() => result.current({ id: 'a2', kind: 'album', title: 'Empty' }))

    expect(player.playPlaylist).not.toHaveBeenCalled()
  })

  it('plays a single track directly', async () => {
    remote.track.mockResolvedValue({ id: 't9' })
    const { result } = renderHook(() => usePlayCollection(), { wrapper })

    await act(() =>
      result.current({ id: 't9', kind: 'track', title: 'Static Lines' }),
    )

    expect(player.play).toHaveBeenCalledWith({ id: 't9' })
  })

  it('leaves a failed album load to the query cache toast instead of toasting twice', async () => {
    const cacheToast = vi.fn()
    const client = new QueryClient({
      queryCache: new QueryCache({ onError: cacheToast }),
    })
    remote.album.mockRejectedValue(new Error('offline'))
    const { result } = renderHook(() => usePlayCollection(), {
      wrapper: ({ children }: PropsWithChildren) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    })

    await act(() => result.current({ id: 'a3', kind: 'album', title: 'Lost' }))

    expect(cacheToast).toHaveBeenCalledTimes(1)
    expect(showApiErrorToast).not.toHaveBeenCalled()
    expect(player.playPlaylist).not.toHaveBeenCalled()
  })

  it('toasts a failed single-track load once', async () => {
    remote.track.mockRejectedValue(new Error('offline'))
    const { result } = renderHook(() => usePlayCollection(), { wrapper })

    await act(() =>
      result.current({ id: 't8', kind: 'track', title: 'Static Lines' }),
    )

    expect(showApiErrorToast).toHaveBeenCalledTimes(1)
  })
})
