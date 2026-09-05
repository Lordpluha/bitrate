import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { TrackManifest } from '@/entities/Player/model/manifest.types'
import type { PlayerSlot } from './audioPlayer.types'

const mocks = vi.hoisted(() => ({
  canPlayThroughMse: vi.fn(() => true),
  playerLog: vi.fn(),
  start: vi.fn<() => Promise<void>>(),
}))

vi.mock('@/entities/Player/api/client', () => ({
  fetchRenditionRange: vi.fn(),
}))

vi.mock('@/entities/Player/lib', () => ({
  canPlayThroughMse: mocks.canPlayThroughMse,
  playerLog: mocks.playerLog,
  StreamLoader: class {
    start = mocks.start
  },
}))

import { attachCmafSource } from './attachCmafSource'

const manifest: TrackManifest = {
  durationMs: 1_000,
  durationTicks: 48_000,
  renditions: [
    {
      bitrate: 128,
      codec: 'mp4a.40.2',
      fragments: [[0, 48_000, 2, 2]],
      initRange: [0, 1],
      size: 4,
    },
  ],
  timescale: 48_000,
  version: 1,
}

const createSlot = (): PlayerSlot => ({
  currentBitrate: null,
  element: document.createElement('audio'),
  hls: null,
  loader: null,
  playbackKey: 'playlist:track:1',
  trackId: 'track',
})

describe('attachCmafSource', () => {
  beforeEach(() => {
    mocks.canPlayThroughMse.mockReturnValue(true)
    mocks.start.mockReset()
  })

  it('falls back when loader startup rejects', async () => {
    const slot = createSlot()
    const onFatalError = vi.fn()
    mocks.start.mockRejectedValue(new Error('sourceopen failed'))

    expect(
      attachCmafSource({
        element: slot.element as HTMLAudioElement,
        isPrefetch: false,
        manifest,
        onFatalError,
        playbackKey: 'playlist:track:1',
        slot,
        trackId: 'track',
      }),
    ).toBe(true)

    await vi.waitFor(() => expect(onFatalError).toHaveBeenCalledOnce())
  })

  it('ignores a startup rejection after another playback claimed the slot', async () => {
    const slot = createSlot()
    const onFatalError = vi.fn()
    mocks.start.mockRejectedValue(new Error('late failure'))

    attachCmafSource({
      element: slot.element as HTMLAudioElement,
      isPrefetch: false,
      manifest,
      onFatalError,
      playbackKey: 'playlist:track:1',
      slot,
      trackId: 'track',
    })
    slot.playbackKey = 'playlist:other:2'
    await Promise.resolve()

    expect(onFatalError).not.toHaveBeenCalled()
  })

  it('returns false without creating a loader when MSE is unsupported', () => {
    const slot = createSlot()
    mocks.canPlayThroughMse.mockReturnValue(false)

    expect(
      attachCmafSource({
        element: slot.element as HTMLAudioElement,
        isPrefetch: true,
        manifest,
        onFatalError: vi.fn(),
        playbackKey: 'playlist:track:1',
        slot,
        trackId: 'track',
      }),
    ).toBe(false)
    expect(mocks.start).not.toHaveBeenCalled()
  })
})
