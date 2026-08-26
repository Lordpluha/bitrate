import type { ThrottlerStorage } from '@nestjs/throttler'
import type { Redis } from 'ioredis'

const INCREMENT_SCRIPT = `
local block_ttl = redis.call('PTTL', KEYS[2])
if block_ttl > 0 then
  local blocked_hits = tonumber(redis.call('GET', KEYS[1]) or ARGV[2])
  return { blocked_hits, redis.call('PTTL', KEYS[1]), 1, block_ttl }
end

local hits = redis.call('INCR', KEYS[1])
local hits_ttl = redis.call('PTTL', KEYS[1])
if hits == 1 or hits_ttl < 0 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
  hits_ttl = tonumber(ARGV[1])
end

if hits > tonumber(ARGV[2]) then
  redis.call('SET', KEYS[2], '1', 'PX', ARGV[3])
  return { hits, hits_ttl, 1, tonumber(ARGV[3]) }
end

return { hits, hits_ttl, 0, 0 }
`

const positiveInteger = (value: number) =>
  Number.isFinite(value) ? Math.max(1, Math.trunc(value)) : 1

const secondsRemaining = (milliseconds: number) =>
  milliseconds > 0 ? Math.ceil(milliseconds / 1_000) : 0

/** Shares throttling state atomically across API replicas through Redis. */
export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(private readonly redis: Redis) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ) {
    const safeKey = key.replaceAll(/[{}]/g, '')
    const safeName = throttlerName.replaceAll(/[^a-zA-Z0-9_-]/g, '_')
    const keyPrefix = `spotify:throttle:{${safeKey}}:${safeName}`
    const result = await this.redis.eval(
      INCREMENT_SCRIPT,
      2,
      `${keyPrefix}:hits`,
      `${keyPrefix}:block`,
      positiveInteger(ttl),
      positiveInteger(limit),
      positiveInteger(blockDuration),
    )

    if (!Array.isArray(result) || result.length !== 4) {
      throw new Error('Redis returned an invalid throttler result')
    }

    const totalHits = Number(result[0] ?? Number.NaN)
    const timeToExpireMs = Number(result[1] ?? Number.NaN)
    const isBlocked = Number(result[2] ?? Number.NaN)
    const timeToBlockExpireMs = Number(result[3] ?? Number.NaN)
    if (
      !(
        Number.isFinite(totalHits) &&
        Number.isFinite(timeToExpireMs) &&
        Number.isFinite(isBlocked) &&
        Number.isFinite(timeToBlockExpireMs)
      )
    ) {
      throw new Error('Redis returned non-numeric throttler values')
    }

    return {
      totalHits,
      timeToExpire: secondsRemaining(timeToExpireMs),
      isBlocked: isBlocked === 1,
      timeToBlockExpire: secondsRemaining(timeToBlockExpireMs),
    }
  }
}
