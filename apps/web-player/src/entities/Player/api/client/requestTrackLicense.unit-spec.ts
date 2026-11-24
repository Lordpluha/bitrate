import { beforeEach, describe, expect, it, vi } from 'vitest'

const { fetchWithAuthRefresh } = vi.hoisted(() => ({
  fetchWithAuthRefresh: vi.fn(),
}))
const { openPlaySession, playSessionToken } = vi.hoisted(() => ({
  openPlaySession: vi.fn(),
  playSessionToken: vi.fn(() => 'token-1' as string | undefined),
}))

vi.mock('@shared/api/client', () => ({ fetchWithAuthRefresh }))
vi.mock('./playSessions', () => ({ openPlaySession, playSessionToken }))

import { requestTrackLicense } from './requestTrackLicense'

const message = new TextEncoder().encode('{"kids":["ASNFZ4mrze8BI0VniavN7w"]}')
  .buffer as ArrayBuffer
const licence = '{"keys":[{"kty":"oct","kid":"a","k":"b"}],"type":"temporary"}'

describe('requestTrackLicense (ADR-0077)', () => {
  beforeEach(() => {
    fetchWithAuthRefresh.mockReset()
    openPlaySession.mockReset()
    playSessionToken.mockReturnValue('token-1')
  })

  it('posts the CDM request with the session token and returns the licence bytes', async () => {
    fetchWithAuthRefresh.mockResolvedValue(
      new Response(licence, { status: 200 }),
    )

    const result = await requestTrackLicense({ message, trackId: 'track-id' })

    expect(new TextDecoder().decode(result)).toBe(licence)
    expect(fetchWithAuthRefresh).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/tracks\/track-id\/license\?t=token-1$/),
      expect.objectContaining({ body: message, method: 'POST' }),
    )
  })

  it('reopens an expired session once and retries', async () => {
    fetchWithAuthRefresh
      .mockResolvedValueOnce(new Response(null, { status: 403 }))
      .mockResolvedValueOnce(new Response(licence, { status: 200 }))

    await requestTrackLicense({ message, trackId: 'track-id' })

    expect(openPlaySession).toHaveBeenCalledWith({ trackId: 'track-id' })
    expect(fetchWithAuthRefresh).toHaveBeenCalledTimes(2)
  })

  it('fails on a refused licence, so the player falls back to clear audio', async () => {
    fetchWithAuthRefresh.mockResolvedValue(new Response(null, { status: 404 }))

    await expect(
      requestTrackLicense({ message, trackId: 'track-id' }),
    ).rejects.toMatchObject({ status: 404 })
  })
})
