import { beforeEach, describe, expect, it } from '@jest/globals'
import type { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ThrottlerException, type ThrottlerStorage } from '@nestjs/throttler'
import { UserThrottlerGuard } from './user-throttler.guard'

/** Counts hits per key and blocks past the limit, like the Redis storage does. */
class CountingStorage implements ThrottlerStorage {
  readonly keys: string[] = []
  private hits = new Map<string, number>()

  increment(key: string, ttl: number, limit: number) {
    this.keys.push(key)
    const totalHits = (this.hits.get(key) ?? 0) + 1
    this.hits.set(key, totalHits)
    return Promise.resolve({
      totalHits,
      timeToExpire: Math.ceil(ttl / 1000),
      isBlocked: totalHits > limit,
      timeToBlockExpire: 0,
    })
  }
}

class PlaybackController {
  open() {
    return undefined
  }
}

type FakeRequest = {
  ip: string
  ips: string[]
  headers: Record<string, string>
  user?: { id: string }
}

function contextFor(request: FakeRequest): ExecutionContext {
  const response = { header: () => undefined, setHeader: () => undefined }
  return {
    getType: () => 'http',
    getClass: () => PlaybackController,
    getHandler: () => PlaybackController.prototype.open,
    switchToHttp: () => ({ getRequest: () => request, getResponse: () => response }),
  } as unknown as ExecutionContext
}

const request = (ip: string, userId?: string): FakeRequest => ({
  ip,
  ips: [],
  headers: {},
  ...(userId ? { user: { id: userId } } : {}),
})

describe('UserThrottlerGuard', () => {
  let storage: CountingStorage
  let guard: UserThrottlerGuard

  beforeEach(async () => {
    storage = new CountingStorage()
    guard = new UserThrottlerGuard(
      { throttlers: [{ name: 'default', ttl: 60_000, limit: 1 }] },
      storage,
      new Reflector(),
    )
    await guard.onModuleInit()
  })

  it('counts one signed-in user across every address', async () => {
    await expect(guard.canActivate(contextFor(request('10.0.0.1', 'user-1')))).resolves.toBe(true)

    await expect(guard.canActivate(contextFor(request('10.0.0.2', 'user-1')))).rejects.toThrow(
      ThrottlerException,
    )
  })

  it('keeps users behind one address apart', async () => {
    await expect(guard.canActivate(contextFor(request('10.0.0.1', 'user-1')))).resolves.toBe(true)
    await expect(guard.canActivate(contextFor(request('10.0.0.1', 'user-2')))).resolves.toBe(true)
  })

  it('falls back to the address when no user is attached', async () => {
    await expect(guard.canActivate(contextFor(request('10.0.0.1')))).resolves.toBe(true)
    await expect(guard.canActivate(contextFor(request('10.0.0.1')))).rejects.toThrow(
      ThrottlerException,
    )
    await expect(guard.canActivate(contextFor(request('10.0.0.2')))).resolves.toBe(true)
  })
})
