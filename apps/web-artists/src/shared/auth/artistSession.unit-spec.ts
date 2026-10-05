import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveArtistSession } from './artistSession'

const artist = {
  id: 'ce14c750-95c6-4f17-a22a-5a08d0c7f777',
  username: 'Test artist',
  avatar: null,
}
const config = {
  apiUrl: 'http://localhost:3000',
  accessCookieName: 'access_token',
  refreshCookieName: 'refresh_token',
}
const fetchMock = vi.fn<typeof fetch>()

afterEach(() => {
  vi.unstubAllGlobals()
  fetchMock.mockReset()
})

describe('artist session', () => {
  it('rejects a visitor with no refresh cookie without contacting the API', async () => {
    vi.stubGlobal('fetch', fetchMock)
    expect(await resolveArtistSession(config)).toEqual({
      status: 'unauthenticated',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('accepts only an API-verified identity and never exposes session tokens', async () => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValueOnce(
      Response.json({ ...artist, secret: 'private' }),
    )
    const session = await resolveArtistSession({
      ...config,
      accessToken: 'valid-access',
      refreshToken: 'valid-refresh',
    })
    expect(session).toEqual({ status: 'authenticated', artist })
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      headers: { cookie: 'access_token=valid-access' },
      cache: 'no-store',
      redirect: 'error',
    })
  })

  it('refreshes an expired access token and forwards rotated cookies', async () => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(
        new Response(null, {
          headers: [
            ['set-cookie', 'access_token=new-access; Path=/; HttpOnly'],
            ['set-cookie', 'refresh_token=new-refresh; Path=/; HttpOnly'],
          ],
        }),
      )
      .mockResolvedValueOnce(Response.json(artist))
    const onCookies = vi.fn()
    expect(
      await resolveArtistSession(
        { ...config, accessToken: 'expired', refreshToken: 'valid-refresh' },
        onCookies,
      ),
    ).toEqual({ status: 'authenticated', artist })
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({
      method: 'POST',
      headers: { cookie: 'refresh_token=valid-refresh' },
    })
    expect(fetchMock.mock.calls[2]?.[1]).toMatchObject({
      headers: { cookie: 'access_token=new-access' },
    })
    expect(onCookies).toHaveBeenCalledWith([
      'access_token=new-access; Path=/; HttpOnly',
      'refresh_token=new-refresh; Path=/; HttpOnly',
    ])
  })

  it('rejects a forged or revoked refresh cookie', async () => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }))
    expect(
      await resolveArtistSession({ ...config, refreshToken: 'forged' }),
    ).toEqual({ status: 'unauthenticated' })
  })

  it.each([
    500, 429,
  ])('keeps API failure %s separate from missing authentication', async (status) => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValueOnce(new Response(null, { status }))
    expect(
      await resolveArtistSession({
        ...config,
        accessToken: 'valid',
        refreshToken: 'valid',
      }),
    ).toEqual({ status: 'unavailable' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('fails closed on an invalid API identity', async () => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValueOnce(
      Response.json({ username: 'Invalid artist' }),
    )
    expect(
      await resolveArtistSession({
        ...config,
        accessToken: 'valid',
        refreshToken: 'valid',
      }),
    ).toEqual({ status: 'unavailable' })
  })

  it('handles network failure without leaking cookies or errors to the client', async () => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockRejectedValueOnce(new Error('private infrastructure details'))
    expect(
      await resolveArtistSession({
        ...config,
        accessToken: 'valid',
        refreshToken: 'valid',
      }),
    ).toEqual({ status: 'unavailable' })
  })
})
