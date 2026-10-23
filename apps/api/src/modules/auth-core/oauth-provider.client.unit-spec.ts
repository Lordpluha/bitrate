import type { AppConfig } from '@common/config'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import type { ConfigService } from '@nestjs/config'
import { OAuthProviderClient, oauthUsername } from './oauth-provider.client'

const CONFIG: Partial<Record<keyof AppConfig, string>> = {
  API_BASE_URL: 'https://api.example.com',
  OAUTH_GOOGLE_CLIENT_ID: 'google-id',
  OAUTH_GOOGLE_CLIENT_SECRET: 'google-secret',
  OAUTH_FACEBOOK_APP_ID: 'fb-id',
  OAUTH_FACEBOOK_APP_SECRET: 'fb-secret',
}

const configOf = (values: Partial<Record<keyof AppConfig, string>>) =>
  ({ get: (key: keyof AppConfig) => values[key] }) as unknown as ConfigService<AppConfig>

const jsonResponse = (body: unknown) => ({ json: async () => body }) as Response

describe('OAuthProviderClient', () => {
  const realFetch = global.fetch
  let client: OAuthProviderClient
  let fetchMock: jest.Mock<typeof fetch>

  beforeEach(() => {
    client = new OAuthProviderClient(configOf(CONFIG))
    fetchMock = jest.fn<typeof fetch>()
    global.fetch = fetchMock
  })

  afterEach(() => {
    global.fetch = realFetch
  })

  it.each([
    ['auth/oauth', 'google', 'https://accounts.google.com/o/oauth2/v2/auth?'],
    ['artists/auth/oauth', 'google', 'https://accounts.google.com/o/oauth2/v2/auth?'],
    ['auth/oauth', 'facebook', 'https://www.facebook.com/v19.0/dialog/oauth?'],
    ['artists/auth/oauth', 'facebook', 'https://www.facebook.com/v19.0/dialog/oauth?'],
  ] as const)('sends %s %s sign-ins back to their own callback', (base, provider, origin) => {
    const url = client.authUrl(provider, base, 'state-1')

    expect(url.startsWith(origin)).toBe(true)
    const params = new URL(url).searchParams
    expect(params.get('redirect_uri')).toBe(
      `https://api.example.com/api/v1/${base}/${provider}/callback`,
    )
    expect(params.get('state')).toBe('state-1')
    expect(params.get('client_id')).toBe(provider === 'google' ? 'google-id' : 'fb-id')
  })

  it.each(['google', 'facebook'] as const)('refuses %s when it is not configured', (provider) => {
    const unconfigured = new OAuthProviderClient(configOf({}))

    expect(() => unconfigured.authUrl(provider, 'auth/oauth', 'state')).toThrow(
      InternalServerErrorException,
    )
  })

  it('returns the verified Google profile', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ access_token: 'token' }))
      .mockResolvedValueOnce(
        jsonResponse({ id: 'g-1', email: 'a@example.com', name: 'A', verified_email: true }),
      )

    await expect(client.exchange('google', 'code', 'auth/oauth')).resolves.toEqual({
      id: 'g-1',
      email: 'a@example.com',
      name: 'A',
    })
  })

  it('rejects a Google account whose email is not verified', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ access_token: 'token' }))
      .mockResolvedValueOnce(
        jsonResponse({ id: 'g-1', email: 'a@example.com', name: 'A', verified_email: false }),
      )

    await expect(client.exchange('google', 'code', 'auth/oauth')).rejects.toThrow(
      UnauthorizedException,
    )
  })

  it('rejects a Facebook account without an email address', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ access_token: 'token' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'f-1', name: 'F' }))

    await expect(client.exchange('facebook', 'code', 'artists/auth/oauth')).rejects.toThrow(
      'Facebook account did not provide an email address',
    )
  })

  it('rejects a code the provider does not exchange for a token', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'invalid_grant' }))

    await expect(client.exchange('google', 'bad-code', 'auth/oauth')).rejects.toThrow(
      'Failed to exchange Google OAuth code',
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('oauthUsername', () => {
  it('keeps a lower-case, underscore-joined base and adds a random suffix', () => {
    expect(oauthUsername('Ana María Smith-Jones, Esq.')).toMatch(
      /^ana_mar_a_smith_jone_[0-9a-f]{8}$/,
    )
  })

  it('differs between two people with the same name', () => {
    expect(oauthUsername('Ana')).not.toBe(oauthUsername('Ana'))
  })
})
