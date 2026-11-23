import type { PrismaService } from '@infra/prisma/prisma.service'
import { beforeEach, describe, expect, it } from '@jest/globals'
import { ForbiddenException, NotFoundException, ServiceUnavailableException } from '@nestjs/common'
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { generateContentKey } from '../encryption/generate-content-key'
import { wrapContentKey } from '../encryption/wrap-content-key'
import type { PlaybackSessionService } from './playback-session.service'
import { TrackLicenseService } from './track-license.service'

const KEK = 'd'.repeat(64)
const TRACK = '00000000-0000-0000-0000-000000000001'
const b64url = (hex: string) => Buffer.from(hex, 'hex').toString('base64url')

describe('TrackLicenseService (ADR-0077)', () => {
  let prisma: DeepMockProxy<PrismaService>
  let sessions: DeepMockProxy<PlaybackSessionService>
  let kek: string | undefined
  let service: TrackLicenseService
  const content = generateContentKey()

  beforeEach(() => {
    prisma = mockDeep<PrismaService>()
    sessions = mockDeep<PlaybackSessionService>()
    kek = KEK
    service = new TrackLicenseService(prisma, sessions, { get: () => kek } as never)
    sessions.authorize.mockResolvedValue({
      sessionId: 's-1',
      userId: 'u-1',
      trackId: TRACK,
      degraded: false,
    })
    const wrapped = wrapContentKey(content, KEK)
    prisma.trackContentKey.findFirst.mockResolvedValue({
      trackId: TRACK,
      keyId: content.keyId,
      wrappedKey: new Uint8Array(wrapped.wrappedKey),
      iv: new Uint8Array(wrapped.iv),
      authTag: new Uint8Array(wrapped.authTag),
      createdAt: new Date(),
    } as never)
  })

  const license = (kids = [b64url(content.keyId)], token = 'signed') =>
    service.license({ trackId: TRACK, token, kids })

  it('answers a ClearKey licence with the track key for a live session', async () => {
    await expect(license()).resolves.toEqual({
      keys: [{ kty: 'oct', kid: b64url(content.keyId), k: b64url(content.key) }],
      type: 'temporary',
    })
    expect(sessions.authorize).toHaveBeenCalledWith('signed', TRACK)
  })

  it('reads the key only for a public track', async () => {
    await license()

    expect(prisma.trackContentKey.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          trackId: TRACK,
          track: { deletedAt: null, processingStatus: 'READY', publishedAt: { not: null } },
        }),
      }),
    )
  })

  it('refuses without a live session for this track, before reading any key', async () => {
    sessions.authorize.mockRejectedValue(new ForbiddenException())

    await expect(license()).rejects.toThrow(ForbiddenException)
    expect(prisma.trackContentKey.findFirst).not.toHaveBeenCalled()
  })

  it('answers 404 for a track without a key or a request for another key id', async () => {
    await expect(license([b64url(generateContentKey().keyId)])).rejects.toThrow(NotFoundException)

    prisma.trackContentKey.findFirst.mockResolvedValue(null)
    await expect(license()).rejects.toThrow(NotFoundException)
  })

  it('answers 503 when the key-encryption key is not configured', async () => {
    kek = undefined

    await expect(license()).rejects.toThrow(ServiceUnavailableException)
  })
})
