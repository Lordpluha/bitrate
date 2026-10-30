import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { createSignedStorageToken } from '@infra/storage/signed-storage-token'
import { createPlaybackToken, verifyPlaybackToken } from './playback-token'

const SECRET = 'test-secret-at-least-32-characters-long'
const claims = { sessionId: 'session-1', userId: 'user-1', trackId: 'track-1' }

describe('playback token', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it('round-trips its claims until it expires', () => {
    const token = createPlaybackToken({ ...claims, expiresInSeconds: 60 }, SECRET)

    expect(verifyPlaybackToken(token, SECRET)).toMatchObject(claims)
  })

  it('refuses a token past its expiry', () => {
    jest.useFakeTimers({ now: new Date('2026-10-30T12:00:00Z') })
    const token = createPlaybackToken({ ...claims, expiresInSeconds: 60 }, SECRET)

    jest.setSystemTime(new Date('2026-10-30T12:01:01Z'))

    expect(verifyPlaybackToken(token, SECRET)).toBeNull()
  })

  it('refuses a token whose claims were edited', () => {
    const token = createPlaybackToken({ ...claims, expiresInSeconds: 60 }, SECRET)
    const [data, signature] = token.split('.')
    const forged = Buffer.from(
      JSON.stringify({
        ...JSON.parse(Buffer.from(data ?? '', 'base64url').toString()),
        tid: 'track-2',
      }),
    ).toString('base64url')

    expect(verifyPlaybackToken(`${forged}.${signature}`, SECRET)).toBeNull()
  })

  it('refuses a token signed with another secret', () => {
    const token = createPlaybackToken(
      { ...claims, expiresInSeconds: 60 },
      'another-secret-of-32-characters!!',
    )

    expect(verifyPlaybackToken(token, SECRET)).toBeNull()
  })

  it('refuses a storage token signed with the same secret', () => {
    const storageToken = createSignedStorageToken('tracks/track-1/cmaf/128.m4a', 60, SECRET)

    expect(verifyPlaybackToken(storageToken, SECRET)).toBeNull()
  })

  it.each(['', 'garbage', 'a.b.c', '.'])('refuses the malformed token %p', (token) => {
    expect(verifyPlaybackToken(token, SECRET)).toBeNull()
  })
})
