import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ForbiddenException } from '@nestjs/common'
import { CHARGE_LISTENER_BUCKET_SCRIPT, chargeListenerBucket } from './listener-bucket'
import { PlaybackPacingError, PlaybackSessionService } from './playback-session.service'
import { createPlaybackToken } from './playback-token'

const SECRET = 'test-secret-at-least-32-characters-long'

/** The handful of ioredis commands the service uses, over in-memory maps. */
class FakeRedis {
  hashes = new Map<string, Map<string, string>>()
  sets = new Map<string, Set<string>>()
  expiries = new Map<string, number>()
  down = false

  /** Answers like ioredis: a rejected promise while "down", never a synchronous throw. */
  private reply<T>(value: () => T): Promise<T> {
    if (this.down) return Promise.reject(new Error('Connection is closed.'))
    return Promise.resolve(value())
  }

  hset(key: string, values: Record<string, string | number>) {
    return this.reply(() => {
      const hash = this.hashes.get(key) ?? new Map<string, string>()
      for (const [field, value] of Object.entries(values)) hash.set(field, String(value))
      this.hashes.set(key, hash)
      return Object.keys(values).length
    })
  }

  hsetnx(key: string, field: string, value: string | number) {
    return this.reply(() => {
      const hash = this.hashes.get(key) ?? new Map<string, string>()
      if (hash.has(field)) return 0
      hash.set(field, String(value))
      this.hashes.set(key, hash)
      return 1
    })
  }

  hget(key: string, field: string) {
    return this.reply(() => this.hashes.get(key)?.get(field) ?? null)
  }

  hincrby(key: string, field: string, by: number) {
    return this.reply(() => {
      const hash = this.hashes.get(key) ?? new Map<string, string>()
      const next = Number(hash.get(field) ?? 0) + by
      hash.set(field, String(next))
      this.hashes.set(key, hash)
      return next
    })
  }

  exists(key: string) {
    return this.reply(() => (this.hashes.has(key) || this.sets.has(key) ? 1 : 0))
  }

  expire(key: string, seconds: number) {
    return this.reply(() => {
      this.expiries.set(key, seconds)
      return 1
    })
  }

  ttl(key: string) {
    return this.reply(() => this.expiries.get(key) ?? -1)
  }

  sadd(key: string, member: string) {
    return this.reply(() => {
      const set = this.sets.get(key) ?? new Set<string>()
      set.add(member)
      this.sets.set(key, set)
      return 1
    })
  }

  smembers(key: string) {
    return this.reply(() => [...(this.sets.get(key) ?? [])])
  }

  del(...keys: string[]) {
    return this.reply(() => {
      for (const key of keys) {
        this.hashes.delete(key)
        this.sets.delete(key)
      }
      return keys.length
    })
  }

  /**
   * Runs the listener bucket script through its TypeScript twin; the Lua itself is exercised
   * against a real Redis in `playback-session.service.int-spec.ts`.
   */
  eval(script: string, _keyCount: number, key: string, ...args: (string | number)[]) {
    return this.reply(() => {
      if (script !== CHARGE_LISTENER_BUCKET_SCRIPT) throw new Error('Unexpected script')
      const [nowMs, audioMs] = args.map(Number)
      const hash = this.hashes.get(key)
      const stored = hash
        ? { levelMs: Number(hash.get('levelMs')), updatedAtMs: Number(hash.get('updatedAtMs')) }
        : undefined
      const { excessMs, bucket } = chargeListenerBucket(stored, audioMs ?? 0, nowMs ?? 0)
      if (excessMs > 0) return excessMs
      this.hashes.set(
        key,
        new Map([
          ['levelMs', String(bucket.levelMs)],
          ['updatedAtMs', String(bucket.updatedAtMs)],
        ]),
      )
      return 0
    })
  }
}

const config = { getOrThrow: () => SECRET }

describe('PlaybackSessionService', () => {
  let redis: FakeRedis
  let metrics: { recordPlaybackSessionDegraded: jest.Mock }
  let service: PlaybackSessionService

  beforeEach(() => {
    jest.useRealTimers()
    redis = new FakeRedis()
    metrics = { recordPlaybackSessionDegraded: jest.fn() }
    service = new PlaybackSessionService(redis as never, config as never, metrics as never)
  })

  const open = (trackId = 'track-1') =>
    service.open({ userId: 'user-1', trackId, deviceId: 'device-1', durationMs: 180_000 })

  it('opens a session that authorises its own track and lives for the track plus 15 minutes', async () => {
    const { token, expiresAt } = await open()

    const session = await service.authorize(token, 'track-1')

    expect(session).toMatchObject({ userId: 'user-1', trackId: 'track-1', degraded: false })
    expect(expiresAt).toBeGreaterThan(Date.now() / 1000 + 180 + 15 * 60 - 5)
    expect([...redis.expiries.values()]).toContain(180 + 15 * 60)
  })

  it('stores the Connect device on the session', async () => {
    const { token } = await open()
    const { sessionId } = await service.authorize(token, 'track-1')

    expect(await redis.hget(`playback:session:${sessionId}`, 'deviceId')).toBe('device-1')
  })

  it('refuses a token for another track', async () => {
    const { token } = await open('track-1')

    await expect(service.authorize(token, 'track-2')).rejects.toThrow(ForbiddenException)
  })

  it('refuses a missing or forged token', async () => {
    await expect(service.authorize(undefined, 'track-1')).rejects.toThrow(ForbiddenException)
    await expect(service.authorize('forged.token', 'track-1')).rejects.toThrow(ForbiddenException)
  })

  it('refuses a validly signed token whose session was revoked', async () => {
    const { token } = await open()

    await service.revokeUser('user-1')

    await expect(service.authorize(token, 'track-1')).rejects.toThrow(ForbiddenException)
  })

  it('hands out audio up to real time plus 60 seconds, then refuses with a retry delay', async () => {
    jest.useFakeTimers({ now: new Date('2026-10-30T12:00:00Z') })
    const { token } = await open()
    const session = await service.authorize(token, 'track-1')

    for (let fragment = 0; fragment < 6; fragment++) await service.charge(session, 10_000)

    const refusal = await service.charge(session, 10_000).catch((error: unknown) => error)
    expect(refusal).toBeInstanceOf(PlaybackPacingError)
    expect((refusal as PlaybackPacingError).retryAfterSeconds).toBe(10)

    jest.setSystemTime(new Date('2026-10-30T12:00:10Z'))
    await expect(service.charge(session, 10_000)).resolves.toBeUndefined()
  })

  it('charges nothing for the init segment and gaps', async () => {
    const { token } = await open()
    const session = await service.authorize(token, 'track-1')

    for (let request = 0; request < 50; request++) await service.charge(session, 0)

    expect((await redis.hget('playback:budget:user-1:track-1', 'servedMs')) ?? '0').toBe('0')
  })

  it('shares one budget across every session the user opens for a track', async () => {
    jest.useFakeTimers({ now: new Date('2026-10-30T12:00:00Z') })
    const first = await service.authorize((await open()).token, 'track-1')
    for (let fragment = 0; fragment < 6; fragment++) await service.charge(first, 10_000)

    const second = await service.authorize((await open()).token, 'track-1')

    await expect(service.charge(second, 10_000)).rejects.toBeInstanceOf(PlaybackPacingError)
    const otherTrack = await service.authorize((await open('track-2')).token, 'track-2')
    await expect(service.charge(otherTrack, 10_000)).resolves.toBeUndefined()
  })

  it('refuses to charge a session revoked mid-stream and never brings it back', async () => {
    const { token } = await open()
    const session = await service.authorize(token, 'track-1')

    await service.revokeUser('user-1')

    await expect(service.charge(session, 10_000)).rejects.toThrow(ForbiddenException)
    await expect(service.authorize(token, 'track-1')).rejects.toThrow(ForbiddenException)
  })

  it('keeps playing on the signed token alone while Redis is down, and reports it', async () => {
    const token = createPlaybackToken(
      { sessionId: 'session-1', userId: 'user-1', trackId: 'track-1', expiresInSeconds: 60 },
      SECRET,
    )
    redis.down = true

    const session = await service.authorize(token, 'track-1')
    await expect(service.charge(session, 10_000)).resolves.toBeUndefined()

    expect(session.degraded).toBe(true)
    expect(metrics.recordPlaybackSessionDegraded).toHaveBeenCalled()
  })

  describe('listener-wide budget (ADR-0072)', () => {
    const fill = async (trackId: string, fragments: number) => {
      const session = await service.authorize((await open(trackId)).token, trackId)
      for (let fragment = 0; fragment < fragments; fragment++) {
        await service.charge(session, 10_000)
      }
      return session
    }

    it('caps a listener at two real-time streams plus a burst, however many tracks are open', async () => {
      jest.useFakeTimers({ now: new Date('2026-11-10T12:00:00Z') })
      await fill('track-1', 6)
      await fill('track-2', 6)
      const third = await fill('track-3', 3)

      const refusal = await service.charge(third, 10_000).catch((error: unknown) => error)

      expect(refusal).toBeInstanceOf(PlaybackPacingError)
      // 10 s over the burst drains at two streams' worth of real time.
      expect((refusal as PlaybackPacingError).retryAfterSeconds).toBe(5)
      expect(await redis.hget('playback:budget:user-1:track-3', 'servedMs')).toBe('30000')

      jest.setSystemTime(new Date('2026-11-10T12:00:05Z'))
      await expect(service.charge(third, 10_000)).resolves.toBeUndefined()
    })

    it('does not let another listener spend this one’s budget', async () => {
      jest.useFakeTimers({ now: new Date('2026-11-10T12:00:00Z') })
      await fill('track-1', 6)
      await fill('track-2', 6)
      await fill('track-3', 3)

      const other = await service.open({
        userId: 'user-2',
        trackId: 'track-3',
        durationMs: 180_000,
      })
      const session = await service.authorize(other.token, 'track-3')

      await expect(service.charge(session, 10_000)).resolves.toBeUndefined()
    })

    it('keeps the budget across a revocation, so signing in again buys no audio', async () => {
      jest.useFakeTimers({ now: new Date('2026-11-10T12:00:00Z') })
      await fill('track-1', 6)
      await fill('track-2', 6)
      await fill('track-3', 3)

      await service.revokeUser('user-1')
      const fresh = await service.authorize((await open('track-4')).token, 'track-4')

      await expect(service.charge(fresh, 10_000)).rejects.toBeInstanceOf(PlaybackPacingError)
    })
  })

  describe('pacing while Redis is down (ADR-0072)', () => {
    const signed = (trackId: string, userId = 'user-1') =>
      createPlaybackToken(
        { sessionId: `session-${trackId}`, userId, trackId, expiresInSeconds: 600 },
        SECRET,
      )

    it('paces a degraded session to real time plus the allowance in memory', async () => {
      jest.useFakeTimers({ now: new Date('2026-11-10T12:00:00Z') })
      redis.down = true
      const session = await service.authorize(signed('track-1'), 'track-1')

      for (let fragment = 0; fragment < 6; fragment++) await service.charge(session, 10_000)

      await expect(service.charge(session, 10_000)).rejects.toBeInstanceOf(PlaybackPacingError)
      jest.setSystemTime(new Date('2026-11-10T12:00:10Z'))
      await expect(service.charge(session, 10_000)).resolves.toBeUndefined()
    })

    it('applies the listener-wide budget in memory across degraded tracks', async () => {
      jest.useFakeTimers({ now: new Date('2026-11-10T12:00:00Z') })
      redis.down = true
      const sessions = await Promise.all(
        ['track-1', 'track-2', 'track-3'].map((track) => service.authorize(signed(track), track)),
      )
      const [first, second, third] = sessions as [
        (typeof sessions)[number],
        (typeof sessions)[number],
        (typeof sessions)[number],
      ]
      for (let fragment = 0; fragment < 6; fragment++) {
        await service.charge(first, 10_000)
        await service.charge(second, 10_000)
      }
      for (let fragment = 0; fragment < 3; fragment++) await service.charge(third, 10_000)

      await expect(service.charge(third, 10_000)).rejects.toBeInstanceOf(PlaybackPacingError)
      const otherListener = await service.authorize(signed('track-9', 'user-2'), 'track-9')
      await expect(service.charge(otherListener, 10_000)).resolves.toBeUndefined()
    })

    it('falls back to memory when Redis drops in the middle of a stream', async () => {
      jest.useFakeTimers({ now: new Date('2026-11-10T12:00:00Z') })
      const session = await service.authorize((await open()).token, 'track-1')
      redis.down = true

      for (let fragment = 0; fragment < 6; fragment++) await service.charge(session, 10_000)

      await expect(service.charge(session, 10_000)).rejects.toBeInstanceOf(PlaybackPacingError)
      expect(metrics.recordPlaybackSessionDegraded).toHaveBeenCalledWith('charge')
    })
  })
})
