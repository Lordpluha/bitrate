import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trackManifestSchema } from '@/entities/Player/api/client'

const { fetchWithAuthRefresh } = vi.hoisted(() => ({
  fetchWithAuthRefresh: vi.fn(),
}))

vi.mock('@/shared/api/client', () => ({ fetchWithAuthRefresh }))

import {
  fetchTrackManifest,
  shouldRetryTrackManifest,
} from './useManifestResolver'

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

describe('fetchTrackManifest', () => {
  beforeEach(() => {
    fetchWithAuthRefresh.mockReset()
  })

  it('treats only a missing manifest as a legacy track', async () => {
    fetchWithAuthRefresh.mockResolvedValue(new Response(null, { status: 404 }))

    await expect(fetchTrackManifest('legacy')).resolves.toBeNull()
  })

  it('keeps transient server failures rejectable for React Query retries', async () => {
    fetchWithAuthRefresh.mockResolvedValue(new Response(null, { status: 503 }))

    await expect(fetchTrackManifest('temporary-failure')).rejects.toMatchObject(
      {
        status: 503,
      },
    )
  })

  it('parses a valid manifest', async () => {
    fetchWithAuthRefresh.mockResolvedValue(Response.json(manifest))

    await expect(fetchTrackManifest('ready')).resolves.toMatchObject({
      version: 1,
    })
  })

  it('does not retry a deterministic manifest schema failure', () => {
    let schemaError: unknown
    try {
      trackManifestSchema.parse({})
    } catch (error) {
      schemaError = error
    }

    expect(shouldRetryTrackManifest(0, schemaError)).toBe(false)
  })
})
