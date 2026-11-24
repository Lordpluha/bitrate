import type { TokenUsage } from '@bitrate/support-core'
import type { Redis } from 'ioredis'
import { modelPrice } from './model-prices'
import type { SupportBudget } from './support-budget'

/** The Redis commands the budget uses. */
export type BudgetRedis = Pick<Redis, 'get' | 'incrby' | 'expire'>

/** Keeps a month's key a little past the month, then lets Redis drop it. */
const KEY_TTL_SECONDS = 40 * 86_400

/**
 * Spend of the support assistant per calendar month (UTC), in whole micro-dollars under one
 * Redis key. Embedding queries cost about a millionth of a dollar each and are not counted.
 */
export class RedisSupportBudget implements SupportBudget {
  constructor(
    private readonly redis: BudgetRedis,
    private readonly chatModel: string,
    private readonly monthlyBudgetUsd: number,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async canSpend(): Promise<boolean> {
    const spent = Number((await this.redis.get(this.key())) ?? 0)
    return spent < this.monthlyBudgetUsd * 1_000_000
  }

  async record(usage: TokenUsage): Promise<void> {
    const price = modelPrice(this.chatModel)
    const micro = Math.ceil(usage.inputTokens * price.input + usage.outputTokens * price.output)
    if (micro <= 0) return
    const key = this.key()
    await this.redis.incrby(key, micro)
    await this.redis.expire(key, KEY_TTL_SECONDS)
  }

  private key(): string {
    return `bitrate:support:budget:${this.now().toISOString().slice(0, 7)}`
  }
}
