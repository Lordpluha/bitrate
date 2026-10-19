import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePlayerStore } from '@/entities/Player'
import { track } from '../__tests__/track.fixture'
import type { ServerPlayer } from '../lib/playerSync'
import { useBitrateConnectSync } from './useBitrateConnectSync'

const api = vi.hoisted(() => ({
  getServerPlayer: vi.fn<() => Promise<ServerPlayer | null>>(),
  registerDevice: vi.fn(async () => 'device-1'),
  saveServerPlayer: vi.fn(async () => undefined),
  saveServerQueue: vi.fn(async () => undefined),
}))
vi.mock('../api/connectApi', () => api)
vi.mock('@shared/hooks', () => ({ useAuth: () => ({ isAuthenticated: true }) }))

const savedQueue: ServerPlayer = {
  currentTrack: track('b'),
  positionMs: 30_000,
  queue: [{ track: track('a') }, { track: track('b') }],
  repeatMode: 'off',
  shuffle: false,
}

describe('useBitrateConnectSync', () => {
  beforeEach(() => {
    usePlayerStore.getState().reset()
    vi.clearAllMocks()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('continues the saved queue, paused, in an empty player', async () => {
    api.getServerPlayer.mockResolvedValue(savedQueue)

    const { result } = renderHook(() => useBitrateConnectSync())

    await waitFor(() => expect(result.current.deviceId).toBe('device-1'))
    const player = usePlayerStore.getState()
    expect(player.currentTrack?.id).toBe('b')
    expect(player.currentTime).toBe(30)
    expect(player.isPlaying).toBe(false)
  })

  it('leaves a player that already has a track alone', async () => {
    api.getServerPlayer.mockResolvedValue(savedQueue)
    usePlayerStore.getState().play(track('local'))

    const { result } = renderHook(() => useBitrateConnectSync())

    await waitFor(() => expect(result.current.deviceId).toBe('device-1'))
    expect(usePlayerStore.getState().currentTrack?.id).toBe('local')
  })

  it('saves the queue and state once this browser plays, marking it active', async () => {
    api.getServerPlayer.mockResolvedValue(null)
    const { result } = renderHook(() => useBitrateConnectSync())
    await waitFor(() => expect(result.current.deviceId).toBe('device-1'))
    vi.useFakeTimers()

    act(() => {
      usePlayerStore.getState().playPlaylist({
        currentPlaylistId: 'p1',
        currentPlaylistName: 'Mix',
        startTrack: track('a'),
        tracks: [track('a'), track('b')],
      })
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000)
    })

    expect(api.registerDevice).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'device-1', isActive: true }),
    )
    expect(api.saveServerQueue).toHaveBeenCalledWith({ trackIds: ['a', 'b'] })
    expect(api.saveServerPlayer).toHaveBeenCalledWith(
      expect.objectContaining({
        currentTrackId: 'a',
        deviceId: 'device-1',
        isPlaying: true,
      }),
    )
  })
})
