import { Inject, Injectable, Logger } from '@nestjs/common'
import type { Redis } from 'ioredis'
import { REDIS_CLIENT } from './cache.constants'

/** Represents the cache service. */
@Injectable()
export class CacheService {
  /** The logger value. */
  private readonly logger = new Logger(CacheService.name)

  /** Creates a new instance. */
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  // Reads from cache if hit; on miss calls fn(), writes result, returns it.
  // If Redis is down, falls back to fn() silently.
  /** Runs the wrap operation. */
  async wrap<T>(ns: string, key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
    try {
      const v = (await this.redis.get(`${ns}:version`)) ?? '0'
      const fullKey = `${ns}:v${v}:${key}`
      const raw = await this.redis.get(fullKey)
      if (raw) return JSON.parse(raw) as T
      const value = await fn()
      await this.redis.set(fullKey, JSON.stringify(value), 'EX', ttl)
      return value
    } catch {
      return fn()
    }
  }

  // Invalidates all cached values in a namespace by bumping the version counter.
  // Old keys become unreachable and expire naturally via TTL — no KEYS/SCAN needed.
  /** Runs the invalidate operation. */
  async invalidate(ns: string): Promise<void> {
    try {
      await this.redis.incr(`${ns}:version`)
    } catch (err) {
      this.logger.warn(`Cache invalidate failed for "${ns}": ${err}`)
    }
  }

  // Deletes a single versioned key within a namespace.
  /** Runs the del operation. */
  async del(ns: string, key: string): Promise<void> {
    try {
      const v = (await this.redis.get(`${ns}:version`)) ?? '0'
      await this.redis.del(`${ns}:v${v}:${key}`)
    } catch (err) {
      this.logger.warn(`Cache del failed for "${ns}:${key}": ${err}`)
    }
  }
}
