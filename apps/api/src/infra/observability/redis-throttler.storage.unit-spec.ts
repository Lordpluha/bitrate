import { describe, expect, it, jest } from '@jest/globals'
import type { Redis } from 'ioredis'
import { RedisThrottlerStorage } from './redis-throttler.storage'

describe('RedisThrottlerStorage', () => {
  it('maps the atomic Redis result to Nest throttler units', async () => {
    const evalCommand = jest
      .fn<(...args: unknown[]) => Promise<unknown>>()
      .mockResolvedValue([11, 59_001, 1, 30_001])
    const storage = new RedisThrottlerStorage({ eval: evalCommand } as unknown as Redis)

    await expect(storage.increment('request-key', 60_000, 10, 30_000, 'default')).resolves.toEqual({
      totalHits: 11,
      timeToExpire: 60,
      isBlocked: true,
      timeToBlockExpire: 31,
    })
    expect(evalCommand).toHaveBeenCalledWith(
      expect.any(String),
      2,
      'spotify:throttle:{request-key}:default:hits',
      'spotify:throttle:{request-key}:default:block',
      60_000,
      10,
      30_000,
    )
  })

  it('fails closed on malformed Redis responses', async () => {
    const evalCommand = jest
      .fn<(...args: unknown[]) => Promise<unknown>>()
      .mockResolvedValue('invalid')
    const storage = new RedisThrottlerStorage({ eval: evalCommand } as unknown as Redis)

    await expect(storage.increment('request-key', 60_000, 10, 60_000, 'default')).rejects.toThrow(
      'Redis returned an invalid throttler result',
    )
  })
})
