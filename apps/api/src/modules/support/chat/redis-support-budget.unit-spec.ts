import { describe, expect, it } from '@jest/globals'
import { type BudgetRedis, RedisSupportBudget } from './redis-support-budget'

class MemoryRedis implements BudgetRedis {
  readonly values = new Map<string, number>()
  readonly ttls = new Map<string, number>()

  get(key: string) {
    const value = this.values.get(key)
    return Promise.resolve(value === undefined ? null : String(value))
  }

  incrby(key: string, by: number) {
    const next = (this.values.get(key) ?? 0) + by
    this.values.set(key, next)
    return Promise.resolve(next)
  }

  expire(key: string, seconds: number) {
    this.ttls.set(key, seconds)
    return Promise.resolve(1)
  }
}

const november = () => new Date('2026-11-23T10:00:00Z')

describe('RedisSupportBudget', () => {
  it('records the cost of a turn in this month’s micro-dollars', async () => {
    const redis = new MemoryRedis()
    const budget = new RedisSupportBudget(redis, 'anthropic:claude-haiku-5-5', 10, november)

    await budget.record({ inputTokens: 5_000, outputTokens: 600 })

    // Haiku 5.5: $0.10 / $0.50 per million tokens = 0.1 / 0.5 micro-dollars per token.
    expect(redis.values.get('bitrate:support:budget:2026-11')).toBe(800)
    expect(redis.ttls.get('bitrate:support:budget:2026-11')).toBeGreaterThan(31 * 86_400)
  })

  it('refuses once the month’s spend reaches the budget', async () => {
    const redis = new MemoryRedis()
    const budget = new RedisSupportBudget(redis, 'anthropic:claude-haiku-5-5', 0.001, november)

    expect(await budget.canSpend()).toBe(true)
    await budget.record({ inputTokens: 5_000, outputTokens: 1_000 }) // 1,000 micro-dollars
    expect(await budget.canSpend()).toBe(false)
  })

  it('starts every month from zero', async () => {
    const redis = new MemoryRedis()
    redis.values.set('bitrate:support:budget:2026-10', 99_000_000)
    const budget = new RedisSupportBudget(redis, 'anthropic:claude-haiku-5-5', 10, november)

    expect(await budget.canSpend()).toBe(true)
  })

  it('prices an unknown model conservatively, never as free', async () => {
    const redis = new MemoryRedis()
    const budget = new RedisSupportBudget(redis, 'openai:some-new-model', 10, november)

    await budget.record({ inputTokens: 1_000, outputTokens: 1_000 })

    expect(redis.values.get('bitrate:support:budget:2026-11')).toBe(12_000)
  })
})
