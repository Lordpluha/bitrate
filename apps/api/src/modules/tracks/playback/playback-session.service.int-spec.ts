import { randomUUID } from 'node:crypto'
import type { AppConfig } from '@common/config'
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'
import { LISTENER_BURST_MS } from './listener-bucket'
import { PlaybackPacingError } from './playback-pacing'
import { PlaybackSessionService } from './playback-session.service'

// Opt in with an isolated Redis endpoint; the suite only touches and deletes its own keys.
const describeRedis = process.env.PLAYBACK_TEST_REDIS_URL ? describe : describe.skip

describe('PlaybackSessionService integration guard', () => {
  it('has a Redis endpoint configured when running in CI', () => {
    if (process.env.CI) expect(process.env.PLAYBACK_TEST_REDIS_URL).toBeTruthy()
  })
})

describeRedis('PlaybackSessionService with Redis', () => {
  let redis: Redis
  let service: PlaybackSessionService
  const users = new Set<string>()
  const metrics = { recordPlaybackSessionDegraded: () => undefined }

  beforeAll(async () => {
    redis = new Redis(process.env.PLAYBACK_TEST_REDIS_URL as string, { maxRetriesPerRequest: 1 })
    await redis.ping()
    const config = new ConfigService<AppConfig>({ JWT_SECRET: 'playback-integration-test-only' })
    service = new PlaybackSessionService(redis, config, metrics as never)
  })

  afterAll(async () => {
    if (!redis) return
    for (const userId of users) {
      const sessionIds = await redis.smembers(`playback:user:${userId}`)
      const budgets = await redis.keys(`playback:budget:${userId}:*`)
      await redis.del(
        `playback:user:${userId}`,
        `playback:listener:${userId}`,
        ...sessionIds.map((id) => `playback:session:${id}`),
        ...budgets,
      )
    }
    await redis.quit()
  })

  const listener = () => {
    const userId = `test-${randomUUID()}`
    users.add(userId)
    return userId
  }

  const session = async (userId: string, trackId: string) => {
    const { token } = await service.open({ userId, trackId, durationMs: 600_000 })
    return service.authorize(token, trackId)
  }

  it('lets parallel charges across many tracks through only up to the listener burst', async () => {
    const userId = listener()
    const sessions = await Promise.all(
      Array.from({ length: 40 }, (_, index) => session(userId, `track-${index}`)),
    )

    const results = await Promise.allSettled(
      sessions.map((playback) => service.charge(playback, 10_000)),
    )

    const accepted = results.filter((result) => result.status === 'fulfilled').length
    const refused = results.filter(
      (result) => result.status === 'rejected' && result.reason instanceof PlaybackPacingError,
    ).length
    expect(accepted * 10_000).toBeLessThanOrEqual(LISTENER_BURST_MS)
    expect(accepted).toBeGreaterThanOrEqual(LISTENER_BURST_MS / 10_000 - 1)
    expect(accepted + refused).toBe(40)
  })

  it('stores the bucket level and refunds the per-track budget on a refusal', async () => {
    const userId = listener()
    for (let index = 0; index < LISTENER_BURST_MS / 10_000; index++) {
      await service.charge(await session(userId, `burst-${index}`), 10_000)
    }

    const over = await session(userId, 'one-too-many')
    await expect(service.charge(over, 10_000)).rejects.toBeInstanceOf(PlaybackPacingError)

    expect(Number(await redis.hget(`playback:listener:${userId}`, 'levelMs'))).toBeGreaterThan(0)
    expect(await redis.ttl(`playback:listener:${userId}`)).toBeGreaterThan(0)
    expect(await redis.hget(`playback:budget:${userId}:one-too-many`, 'servedMs')).toBe('0')
  })
})
