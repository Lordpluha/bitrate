import { randomUUID } from 'node:crypto'
import type { AppConfig } from '@common/config'
import { REDIS_CLIENT } from '@infra/cache/cache.constants'
import { MetricsService } from '@infra/observability/metrics.service'
import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Redis } from 'ioredis'
import { PLAYBACK_ERRORS } from './errors'
import { createPlaybackToken, verifyPlaybackToken } from './playback-token'

/** A session outlives its track by this much, so an ordinary play never needs a new token. */
const SESSION_GRACE_SECONDS = 15 * 60

/** Audio a session may receive ahead of real time: the player's buffer plus switches and seeks. */
const PACING_ALLOWANCE_MS = 60_000

const sessionKey = (sessionId: string) => `playback:session:${sessionId}`
const userSessionsKey = (userId: string) => `playback:user:${userId}`

/** Input for {@link PlaybackSessionService.open}. */
export type OpenPlaybackSessionInput = {
  userId: string
  trackId: string
  /** The Bitrate Connect device, kept for stage 3; it restricts nothing yet. */
  deviceId?: string
  durationMs: number
}

/** A token the client appends to every rendition request, and when it stops working. */
export type OpenedPlaybackSession = {
  token: string
  /** Unix seconds. */
  expiresAt: number
}

/** A verified session; `degraded` while Redis is unreachable and only the signature was checked. */
export type AuthorizedPlaybackSession = {
  sessionId: string
  userId: string
  trackId: string
  degraded: boolean
}

/** The session asked for more audio than real time allows; retry after this many seconds. */
export class PlaybackPacingError extends Error {
  constructor(readonly retryAfterSeconds: number) {
    super('Playback is ahead of real time')
  }
}

/**
 * Playback sessions (ADR-0065 stage 2): a signed token per play, a Redis record that keeps it
 * revocable and counts the audio it has received, and real-time pacing on top of that count.
 * While Redis is unreachable a validly signed, unexpired token still plays (D18); revocation and
 * pacing resume with Redis.
 */
@Injectable()
export class PlaybackSessionService {
  private readonly logger = new Logger(PlaybackSessionService.name, { timestamp: true })

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly config: ConfigService<AppConfig>,
    private readonly metrics: MetricsService,
  ) {}

  private get secret(): string {
    return this.config.getOrThrow('JWT_SECRET')
  }

  async open({
    userId,
    trackId,
    deviceId,
    durationMs,
  }: OpenPlaybackSessionInput): Promise<OpenedPlaybackSession> {
    const sessionId = randomUUID()
    const ttlSeconds = Math.ceil(durationMs / 1000) + SESSION_GRACE_SECONDS
    const key = sessionKey(sessionId)
    const userKey = userSessionsKey(userId)

    await this.redis.hset(key, {
      userId,
      trackId,
      ...(deviceId ? { deviceId } : {}),
      openedAtMs: Date.now(),
      servedMs: 0,
    })
    await this.redis.expire(key, ttlSeconds)
    await this.redis.sadd(userKey, sessionId)
    if ((await this.redis.ttl(userKey)) < ttlSeconds) await this.redis.expire(userKey, ttlSeconds)

    const token = createPlaybackToken(
      { sessionId, userId, trackId, expiresInSeconds: ttlSeconds },
      this.secret,
    )
    return { token, expiresAt: Math.floor(Date.now() / 1000) + ttlSeconds }
  }

  /** @throws ForbiddenException for a missing, forged, expired, other-track or revoked token. */
  async authorize(token: string | undefined, trackId: string): Promise<AuthorizedPlaybackSession> {
    const claims = token ? verifyPlaybackToken(token, this.secret) : null
    if (!claims || claims.trackId !== trackId) {
      throw new ForbiddenException(PLAYBACK_ERRORS.SESSION_REQUIRED)
    }
    const session = { ...claims, degraded: false }

    try {
      if ((await this.redis.exists(sessionKey(claims.sessionId))) === 0) {
        throw new ForbiddenException(PLAYBACK_ERRORS.SESSION_ENDED)
      }
      return session
    } catch (error) {
      if (error instanceof ForbiddenException) throw error
      this.reportDegraded('authorize', error)
      return { ...session, degraded: true }
    }
  }

  /**
   * Counts `audioMs` against the session and refuses it when the session would be more than
   * {@link PACING_ALLOWANCE_MS} ahead of the time since it opened (D16).
   * @throws PlaybackPacingError with the seconds until the request would fit.
   */
  async charge(session: AuthorizedPlaybackSession, audioMs: number): Promise<void> {
    if (session.degraded || audioMs <= 0) return
    const key = sessionKey(session.sessionId)

    let refusal: PlaybackPacingError | null = null
    try {
      const served = await this.redis.hincrby(key, 'servedMs', audioMs)
      const openedAtMs = Number(await this.redis.hget(key, 'openedAtMs'))
      const allowanceMs = Date.now() - openedAtMs + PACING_ALLOWANCE_MS
      if (served > allowanceMs) {
        await this.redis.hincrby(key, 'servedMs', -audioMs)
        refusal = new PlaybackPacingError(Math.ceil((served - allowanceMs) / 1000))
      }
    } catch (error) {
      this.reportDegraded('charge', error)
      return
    }
    if (refusal) throw refusal
  }

  /** Ends every session of a user: logout and password resets call this (D11). */
  async revokeUser(userId: string): Promise<void> {
    const userKey = userSessionsKey(userId)
    try {
      const sessionIds = await this.redis.smembers(userKey)
      await this.redis.del(userKey, ...sessionIds.map(sessionKey))
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown error'
      this.logger.error(`Could not revoke playback sessions of user ${userId}: ${reason}`)
    }
  }

  private reportDegraded(step: 'authorize' | 'charge', error: unknown) {
    const reason = error instanceof Error ? error.message : 'unknown error'
    this.logger.warn(`Playback sessions degraded (${step}): Redis unavailable — ${reason}`)
    this.metrics.recordPlaybackSessionDegraded(step)
  }
}
