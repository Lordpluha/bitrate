import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { openPlaySession } = vi.hoisted(() => ({
  openPlaySession: vi.fn(),
}))

vi.mock('@/entities/Player/api/client', () => ({ openPlaySession }))

import { useManifestResolver } from './useManifestResolver'

const manifest = {
  durationMs: 1_000,
  durationTicks: 48_000,
  renditions: [
    {
      bitrate: 128,
      codec: 'mp4a.40.2',
      fragments: [[0, 48_000, 100, 50]],
      initRange: [0, 99],
      size: 150,
    },
  ],
  timescale: 48_000,
  version: 1,
}

const resolve = (trackId: string) =>
  renderHook(() => useManifestResolver()).result.current(trackId)

describe('useManifestResolver', () => {
  beforeEach(() => {
    openPlaySession.mockReset()
  })

  it('opens a playback session for every play and hands the element its manifest', async () => {
    openPlaySession.mockResolvedValue({
      expiresAt: 1,
      manifest,
      token: 'signed',
    })

    await expect(resolve('track-1')).resolves.toEqual(manifest)
    await resolve('track-1')

    expect(openPlaySession).toHaveBeenCalledTimes(2)
    expect(openPlaySession).toHaveBeenCalledWith({ trackId: 'track-1' })
  })

  it('resolves null for a track that cannot play yet', async () => {
    openPlaySession.mockResolvedValue(null)

    await expect(resolve('not-ready')).resolves.toBeNull()
  })

  it('resolves null when the session cannot be opened, so the element reports the track', async () => {
    openPlaySession.mockRejectedValue(new Error('503'))

    await expect(resolve('track-2')).resolves.toBeNull()
  })
})
