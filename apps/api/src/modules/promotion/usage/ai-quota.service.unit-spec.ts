import { beforeEach, describe, expect, it } from '@jest/globals'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { parseModelRef } from '../ai/model-routing'
import { AiQuotaExceededException, AiQuotaService } from './ai-quota.service'
import { AiUsageService } from './ai-usage.service'

const NOW = new Date('2026-11-24T15:00:00Z')

describe('AiUsageService', () => {
  let prisma: PrismaMock
  let usage: AiUsageService

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    usage = new AiUsageService(prisma)
  })

  it('records a call with its cost and returns the cost', async () => {
    await expect(
      usage.record({
        artistId: 'artist-1',
        task: 'plan',
        model: parseModelRef('anthropic:claude-sonnet-5-5'),
        usage: { inputTokens: 1_000, cachedInputTokens: 0, outputTokens: 500 },
        outcome: 'SUCCEEDED',
      }),
    ).resolves.toBe(7_000)
    expect(prisma.aiUsage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        artistId: 'artist-1',
        feature: 'promotion',
        task: 'plan',
        provider: 'anthropic',
        model: 'claude-sonnet-5-5',
        costMicroUsd: 7_000,
        outcome: 'SUCCEEDED',
      }),
    })
  })

  it('sums only the current UTC month', async () => {
    prisma.aiUsage.aggregate.mockResolvedValue({ _sum: { costMicroUsd: 420_000 } } as never)
    await expect(usage.monthCostMicroUsd('artist-1', NOW)).resolves.toBe(420_000)
    expect(prisma.aiUsage.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { artistId: 'artist-1', createdAt: { gte: new Date('2026-11-01T00:00:00Z') } },
      }),
    )
  })

  it('reads an artist without calls as zero', async () => {
    prisma.aiUsage.aggregate.mockResolvedValue({ _sum: { costMicroUsd: null } } as never)
    await expect(usage.monthCostMicroUsd('artist-1', NOW)).resolves.toBe(0)
  })
})

describe('AiQuotaService', () => {
  let prisma: PrismaMock
  let quota: AiQuotaService

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    quota = new AiQuotaService(new AiUsageService(prisma), { freeMicroUsd: 2_000_000 })
  })

  const spent = (micro: number) =>
    prisma.aiUsage.aggregate.mockResolvedValue({ _sum: { costMicroUsd: micro } } as never)

  it('reports the allowance and when it resets', async () => {
    spent(420_000)
    await expect(quota.allowance('artist-1', NOW)).resolves.toEqual({
      usedMicroUsd: 420_000,
      limitMicroUsd: 2_000_000,
      resetsAt: new Date('2026-12-01T00:00:00Z'),
    })
  })

  it('lets an artist under the ceiling generate', async () => {
    spent(1_999_999)
    await expect(quota.assertAvailable('artist-1', NOW)).resolves.toBeUndefined()
  })

  it('stops an artist who reached the ceiling with a 402 and the reset date', async () => {
    spent(2_000_000)
    const error = await quota.assertAvailable('artist-1', NOW).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(AiQuotaExceededException)
    expect((error as AiQuotaExceededException).getStatus()).toBe(402)
    expect((error as AiQuotaExceededException).getResponse()).toEqual({
      message: 'errors.promotion.ai_quota_exceeded',
      args: { resetsAt: '2026-12-01' },
    })
  })
})
