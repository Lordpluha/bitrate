import { randomUUID } from 'node:crypto'
import type { AppConfig } from '@common/config'
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'
import { ArtistEmailCodeService } from './artist-email-code.service'
import { ARTIST_AUTH_ERRORS } from './errors'

// Opt in with an isolated Redis endpoint; never flush the database or touch other keys.
const describeRedis = process.env.EMAIL_CODE_TEST_REDIS_URL ? describe : describe.skip

describeRedis('ArtistEmailCodeService with Redis', () => {
  let redis: Redis
  let service: ArtistEmailCodeService
  const ownedKeys = new Set<string>()
  const artistId = () => {
    const id = `test-${randomUUID()}`
    ownedKeys.add(`artist-email-code:${id}`)
    ownedKeys.add(`artist-email-code-failures:${id}`)
    return id
  }

  beforeAll(async () => {
    redis = new Redis(process.env.EMAIL_CODE_TEST_REDIS_URL!, { maxRetriesPerRequest: 1 })
    await redis.ping()
    const config = new ConfigService<AppConfig>({ JWT_SECRET: 'email-code-integration-test-only' })
    service = new ArtistEmailCodeService(redis, config)
  })

  afterAll(async () => {
    if (!redis) return
    if (ownedKeys.size) await redis.del(...ownedKeys)
    await redis.quit()
  })

  it('stores no plaintext code and accepts it exactly once', async () => {
    const id = artistId()
    const code = await service.issue(id)
    expect(code).toMatch(/^\d{6}$/)
    expect(await redis.hget(`artist-email-code:${id}`, 'hash')).not.toBe(code)
    expect(await redis.ttl(`artist-email-code:${id}`)).toBeGreaterThan(590)
    await service.consume(id, code)
    await expect(service.consume(id, code)).rejects.toThrow(
      ARTIST_AUTH_ERRORS.INVALID_VERIFICATION_CODE,
    )
  })

  it('blocks guessing after five attempts, even with the correct code', async () => {
    const id = artistId()
    const code = await service.issue(id)
    const wrong = code === '000000' ? '000001' : '000000'
    for (let attempt = 0; attempt < 5; attempt++) {
      await expect(service.consume(id, wrong)).rejects.toThrow(
        ARTIST_AUTH_ERRORS.INVALID_VERIFICATION_CODE,
      )
    }
    await expect(service.consume(id, code)).rejects.toThrow(
      ARTIST_AUTH_ERRORS.INVALID_VERIFICATION_CODE,
    )
  })

  it('keeps counting failures across resent codes', async () => {
    const id = artistId()
    for (let round = 0; round < 4; round++) {
      const code = await service.issue(id)
      const wrong = code === '000000' ? '000001' : '000000'
      for (let attempt = 0; attempt < 5; attempt++) {
        await expect(service.consume(id, wrong)).rejects.toThrow(
          ARTIST_AUTH_ERRORS.INVALID_VERIFICATION_CODE,
        )
      }
    }
    const fresh = await service.issue(id)
    await expect(service.consume(id, fresh)).rejects.toThrow(
      ARTIST_AUTH_ERRORS.INVALID_VERIFICATION_CODE,
    )
    expect(await redis.ttl(`artist-email-code-failures:${id}`)).toBeGreaterThan(0)
  })

  it('expires codes and isolates artists', async () => {
    const id = artistId()
    const code = await service.issue(id)
    await expect(service.consume(artistId(), code)).rejects.toThrow(
      ARTIST_AUTH_ERRORS.INVALID_VERIFICATION_CODE,
    )
    await redis.pexpire(`artist-email-code:${id}`, 1)
    await new Promise((resolve) => setTimeout(resolve, 20))
    await expect(service.consume(id, code)).rejects.toThrow(
      ARTIST_AUTH_ERRORS.INVALID_VERIFICATION_CODE,
    )
  })

  it('resending rotates a code and concurrent consumption has one winner', async () => {
    const id = artistId()
    const old = await service.issue(id)
    const next = await service.issue(id)
    if (old !== next)
      await expect(service.consume(id, old)).rejects.toThrow(
        ARTIST_AUTH_ERRORS.INVALID_VERIFICATION_CODE,
      )
    const attempts = await Promise.allSettled(
      Array.from({ length: 3 }, () => service.consume(id, next)),
    )
    expect(attempts.filter((attempt) => attempt.status === 'fulfilled')).toHaveLength(1)
  })

  it('limits resend requests per email regardless of account existence', async () => {
    const email = `${randomUUID()}@example.test`
    const spy = jest.spyOn(redis, 'set')
    await service.reserveResend(email)
    const key = spy.mock.calls.at(-1)?.[0]
    if (typeof key === 'string') ownedKeys.add(key)
    await expect(service.reserveResend(email)).rejects.toThrow(
      'Please wait before requesting another code',
    )
    spy.mockRestore()
  })
})
