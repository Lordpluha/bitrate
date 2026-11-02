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

import { fetchRenditionRange, getRenditionUrl } from './hooks'

const fetchRange = () =>
  fetchRenditionRange({
    bitrate: 128,
    expectedSize: 10,
    range: [2, 4],
    signal: new AbortController().signal,
    trackId: 'track-id',
  })

const response = (
  status: number,
  bytes: number[],
  contentRange: string | null = 'bytes 2-4/10',
) =>
  new Response(new Uint8Array(bytes), {
    headers: contentRange
      ? {
          'Content-Length': String(bytes.length),
          'Content-Range': contentRange,
        }
      : undefined,
    status,
  })

describe('getRenditionUrl', () => {
  beforeEach(() => {
    fetchWithAuthRefresh.mockReset()
    playSessionToken.mockReturnValue('token-1')
  })

  it('points at the rendition file with the newest session token of the track', () => {
    expect(getRenditionUrl({ bitrate: 192, trackId: 'track-id' })).toMatch(
      /\/api\/v1\/tracks\/track-id\/cmaf\/192\?t=token-1$/,
    )
  })

  it('is the same file, with the same token, the fragment ranges are read from', async () => {
    fetchWithAuthRefresh.mockResolvedValue(response(206, [1, 2, 3]))

    await fetchRange()

    expect(fetchWithAuthRefresh).toHaveBeenCalledWith(
      getRenditionUrl({ bitrate: 128, trackId: 'track-id' }),
      expect.anything(),
    )
  })
})

describe('fetchRenditionRange with playback sessions', () => {
  beforeEach(() => {
    fetchWithAuthRefresh.mockReset()
    openPlaySession.mockReset()
    playSessionToken.mockReturnValue('token-1')
  })

  it('opens one new session when the token is refused, then retries with it', async () => {
    fetchWithAuthRefresh
      .mockResolvedValueOnce(new Response(null, { status: 403 }))
      .mockResolvedValueOnce(response(206, [1, 2, 3]))
    openPlaySession.mockImplementation(async () => {
      playSessionToken.mockReturnValue('token-2')
      return {}
    })

    await expect(fetchRange()).resolves.toBeInstanceOf(ArrayBuffer)

    expect(openPlaySession).toHaveBeenCalledWith({ trackId: 'track-id' })
    const [retryUrl] = fetchWithAuthRefresh.mock.calls[1] as [string]
    expect(retryUrl).toMatch(/\?t=token-2$/)
  })

  it('gives up when the new session is refused too', async () => {
    fetchWithAuthRefresh.mockResolvedValue(new Response(null, { status: 403 }))
    openPlaySession.mockResolvedValue({})

    await expect(fetchRange()).rejects.toThrow()
    expect(openPlaySession).toHaveBeenCalledTimes(1)
  })

  it('waits Retry-After when the session is ahead of real time, then retries', async () => {
    fetchWithAuthRefresh
      .mockResolvedValueOnce(
        new Response(null, { headers: { 'Retry-After': '0' }, status: 429 }),
      )
      .mockResolvedValueOnce(response(206, [1, 2, 3]))

    await expect(fetchRange()).resolves.toBeInstanceOf(ArrayBuffer)
    expect(fetchWithAuthRefresh).toHaveBeenCalledTimes(2)
    expect(openPlaySession).not.toHaveBeenCalled()
  })
})

describe('fetchRenditionRange', () => {
  beforeEach(() => {
    fetchWithAuthRefresh.mockReset()
  })

  it('accepts an exact partial response', async () => {
    fetchWithAuthRefresh.mockResolvedValue(response(206, [1, 2, 3]))

    await expect(fetchRange()).resolves.toHaveProperty('byteLength', 3)
  })

  it('rejects a server that ignores Range and returns the whole file', async () => {
    fetchWithAuthRefresh.mockResolvedValue(response(200, [1, 2, 3]))

    await expect(fetchRange()).rejects.toMatchObject({ status: 200 })
  })

  it('rejects an unsatisfied range explicitly', async () => {
    fetchWithAuthRefresh.mockResolvedValue(response(416, [], null))

    await expect(fetchRange()).rejects.toMatchObject({ status: 416 })
  })

  it('rejects a mismatched Content-Range', async () => {
    fetchWithAuthRefresh.mockResolvedValue(
      response(206, [1, 2, 3], 'bytes 1-3/10'),
    )

    await expect(fetchRange()).rejects.toThrow(/Content-Range/)
  })

  it('rejects a Content-Range total that disagrees with the manifest', async () => {
    fetchWithAuthRefresh.mockResolvedValue(
      response(206, [1, 2, 3], 'bytes 2-4/11'),
    )

    await expect(fetchRange()).rejects.toThrow(/Content-Range/)
  })

  it('rejects a truncated body', async () => {
    const truncated = response(206, [1, 2])
    truncated.headers.delete('Content-Length')
    fetchWithAuthRefresh.mockResolvedValue(truncated)

    await expect(fetchRange()).rejects.toThrow(/unexpected length/)
  })
})
