import type { AppConfig } from '@common/config'
import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { unwrapContentKey } from '../encryption/unwrap-content-key'
import { PLAYBACK_ERRORS } from '../errors'
import { PUBLIC_TRACK_WHERE } from '../orm'
import { PlaybackSessionService } from './playback-session.service'

/** Input for {@link TrackLicenseService.license}. */
export type TrackLicenseInput = {
  trackId: string
  token: string | undefined
  /** Key ids the CDM asked for, base64url as in a ClearKey licence request. */
  kids: string[]
}

/** A W3C ClearKey licence: one JSON Web Key per granted key id. */
export type ClearKeyLicence = {
  keys: { kty: 'oct'; kid: string; k: string }[]
  type: 'temporary'
}

const toBase64Url = (hex: string) => Buffer.from(hex, 'hex').toString('base64url')

/**
 * Releases a track's content key as a ClearKey licence, only against a live play session for
 * that track (ADR-0077, ADR-0067), so revocation and the listener limits apply to keys as they do
 * to bytes.
 */
@Injectable()
export class TrackLicenseService {
  private readonly logger = new Logger(TrackLicenseService.name, { timestamp: true })

  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: PlaybackSessionService,
    private readonly config: ConfigService<AppConfig>,
  ) {}

  /**
   * @throws ForbiddenException without a live session for this track.
   * @throws NotFoundException when the track has no key or the request names another key id.
   * @throws ServiceUnavailableException when no key-encryption key is configured.
   */
  async license({ trackId, token, kids }: TrackLicenseInput): Promise<ClearKeyLicence> {
    await this.sessions.authorize(token, trackId)

    const stored = await this.prisma.trackContentKey.findFirst({
      where: { trackId, track: PUBLIC_TRACK_WHERE },
      select: { keyId: true, wrappedKey: true, iv: true, authTag: true },
    })
    const kid = stored ? toBase64Url(stored.keyId) : null
    if (!(stored && kid && kids.includes(kid))) {
      throw new NotFoundException(PLAYBACK_ERRORS.KEY_NOT_FOUND)
    }

    const kek = this.config.get('PLAYBACK_KEY_ENCRYPTION_KEY')
    if (!kek) {
      this.logger.error(`Track ${trackId} has a content key but no key-encryption key is set`)
      throw new ServiceUnavailableException(PLAYBACK_ERRORS.KEY_UNAVAILABLE)
    }

    const key = unwrapContentKey(
      {
        keyId: stored.keyId,
        wrappedKey: Buffer.from(stored.wrappedKey),
        iv: Buffer.from(stored.iv),
        authTag: Buffer.from(stored.authTag),
      },
      kek,
    )
    return { keys: [{ kty: 'oct', kid, k: toBase64Url(key) }], type: 'temporary' }
  }
}
