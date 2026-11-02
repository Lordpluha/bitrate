import { beforeEach, describe, expect, it, vi } from 'vitest'

const { fetchWithAuthRefresh } = vi.hoisted(() => ({
  fetchWithAuthRefresh: vi.fn(),
}))

vi.mock('@shared/api/client', () => ({ fetchWithAuthRefresh }))

import { ApiRequestError } from '@/shared/api/errors'
import { openPlaySession, playSessionToken } from './playSessions'

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

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  })

describe('openPlaySession', () => {
  beforeEach(() => {
    fetchWithAuthRefresh.mockReset()
  })

  it('opens a session for the track and remembers its token for rendition requests', async () => {
    fetchWithAuthRefresh.mockResolvedValue(
      json(201, { expiresAt: 1_900_000_000, manifest, token: 'signed.token' }),
    )

    const session = await openPlaySession({ trackId: 'track-1' })

    const [url, init] = fetchWithAuthRefresh.mock.calls[0] as [
      string,
      RequestInit,
    ]
    expect(url).toMatch(/\/api\/v1\/tracks\/track-1\/play-sessions$/)
    expect(init.method).toBe('POST')
    expect(session?.manifest.renditions[0]?.bitrate).toBe(128)
    expect(playSessionToken({ trackId: 'track-1' })).toBe('signed.token')
  })

  it('treats a track that cannot play yet as no session', async () => {
    fetchWithAuthRefresh.mockResolvedValue(new Response(null, { status: 404 }))

    await expect(openPlaySession({ trackId: 'not-ready' })).resolves.toBeNull()
    expect(playSessionToken({ trackId: 'not-ready' })).toBeUndefined()
  })

  it('reports other failures', async () => {
    fetchWithAuthRefresh.mockResolvedValue(new Response(null, { status: 503 }))

    await expect(
      openPlaySession({ trackId: 'track-2' }),
    ).rejects.toBeInstanceOf(ApiRequestError)
  })

  it('refuses a session response without a token', async () => {
    fetchWithAuthRefresh.mockResolvedValue(
      json(201, { expiresAt: 1, manifest }),
    )

    await expect(openPlaySession({ trackId: 'track-3' })).rejects.toThrow()
  })
})
