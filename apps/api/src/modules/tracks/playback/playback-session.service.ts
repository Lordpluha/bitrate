import { randomUUID } from 'node:crypto'
import type { AppConfig } from '@common/config'
import { REDIS_CLIENT } from '@infra/cache/cache.constants'
import { MetricsService } from '@infra/observability/metrics.service'
import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Redis } from 'ioredis'
import { PLAYBACK_ERRORS } from '../errors'
import {
  CHARGE_LISTENER_BUCKET_SCRIPT,
  LISTENER_BUCKET_TTL_SECONDS,
  LISTENER_BURST_MS,
  LISTENER_CONCURRENT_STREAMS,
  listenerRetryAfterSeconds,
} from './listener-bucket'
import { LocalPlaybackPacer } from './local-playback-pacer'
import { PACING_ALLOWANCE_MS, PlaybackPacingError } from './playback-pacing'
import { createPlaybackToken, verifyPlaybackToken } from './playback-token'

export { PlaybackPacingError } from './playback-pacing'

/** A session outlives its track by this much, so an ordinary play never needs a new token. */
const SESSION_GRACE_SECONDS = 15 * 60

const sessionKey = (sessionId: string) => `playback:session:${sessionId}`
const userSessionsKey = (userId: string) => `playback:user:${userId}`
/** One pacing budget per listener and track, so opening more sessions buys no extra audio. */
const budgetKey = (userId: string, trackId: string) => `playback:budget:${userId}:${trackId}`
/** One bucket per listener across every track (ADR-0072); revocation keeps it. */
const listenerBucketKey = (userId: string) => `playback:listener:${userId}`

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

/**
 * Playback sessions (ADR-0065 stage 2): a signed token per play, a Redis record that keeps it
 * revocable, and real-time pacing against a budget the listener's sessions for a track share,
 * capped across tracks by a listener-wide bucket (ADR-0072). While Redis is unreachable a validly
 * signed, unexpired token still plays (D18) and is paced in memory; revocation resumes with Redis.
 */
@Injectable()
export class PlaybackSessionService {
  private readonly localPacer = new LocalPlaybackPacer()

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
    const budget = budgetKey(userId, trackId)

    await this.redis.hset(key, {
      userId,
      trackId,
      ...(deviceId ? { deviceId } : {}),
      openedAtMs: Date.now(),
    })
    await this.redis.expire(key, ttlSeconds)
    // The first session for the track starts the clock; later ones join it.
    await this.redis.hsetnx(budget, 'openedAtMs', Date.now())
    await this.redis.expire(budget, ttlSeconds)
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
    // Always verify: an absent token is an empty string, which never passes the signature check.
    const claims = verifyPlaybackToken(token ?? '', this.secret)
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
   * Counts `audioMs` against the listener's budget for the track and refuses it when that budget
   * would be more than {@link PACING_ALLOWANCE_MS} ahead of the time since its first session
   * opened (D16), or when the listener's bucket across all tracks would overflow (ADR-0072).
   * Fails closed: a session revoked mid-stream stops being served. Without Redis the same rules
   * run in this process's memory.
   * @throws PlaybackPacingError with the seconds until the request would fit.
   * @throws ForbiddenException when the session or its budget no longer exists.
   */
  async charge(session: AuthorizedPlaybackSession, audioMs: number): Promise<void> {
    if (audioMs <= 0) return
    if (session.degraded) {
      this.localPacer.charge(session, audioMs)
      return
    }
    const budget = budgetKey(session.userId, session.trackId)

    let refusal: PlaybackPacingError | ForbiddenException | null = null
    try {
      if ((await this.redis.exists(sessionKey(session.sessionId))) === 0) {
        throw new ForbiddenException(PLAYBACK_ERRORS.SESSION_ENDED)
      }
      const served = await this.redis.hincrby(budget, 'servedMs', audioMs)
      const openedAt = await this.redis.hget(budget, 'openedAtMs')
      if (openedAt === null) {
        // HINCRBY recreated an expired budget without its clock: drop it rather than pace on NaN.
        await this.redis.del(budget)
        throw new ForbiddenException(PLAYBACK_ERRORS.SESSION_ENDED)
      }
      const allowanceMs = Date.now() - Number(openedAt) + PACING_ALLOWANCE_MS
      if (served > allowanceMs) {
        await this.redis.hincrby(budget, 'servedMs', -audioMs)
        refusal = new PlaybackPacingError(Math.ceil((served - allowanceMs) / 1000))
      } else {
        const excessMs = await this.chargeListener(session.userId, audioMs)
        if (excessMs > 0) {
          await this.redis.hincrby(budget, 'servedMs', -audioMs)
          refusal = new PlaybackPacingError(listenerRetryAfterSeconds(excessMs))
        }
      }
    } catch (error) {
      if (error instanceof ForbiddenException) throw error
      this.reportDegraded('charge', error)
      this.localPacer.charge(session, audioMs)
      return
    }
    if (refusal) throw refusal
  }

  /** Charges the listener's bucket atomically; returns the overflow in ms, 0 when it fits. */
  private async chargeListener(userId: string, audioMs: number): Promise<number> {
    const result = await this.redis.eval(
      CHARGE_LISTENER_BUCKET_SCRIPT,
      1,
      listenerBucketKey(userId),
      Date.now(),
      audioMs,
      LISTENER_CONCURRENT_STREAMS,
      LISTENER_BURST_MS,
      LISTENER_BUCKET_TTL_SECONDS,
    )
    const excessMs = Number(result)
    if (!Number.isFinite(excessMs)) throw new Error('Redis returned an invalid listener bucket')
    return excessMs
  }

  /** Ends every session of a user: logout, password reset and sign-in revocation call this (D11). */
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
