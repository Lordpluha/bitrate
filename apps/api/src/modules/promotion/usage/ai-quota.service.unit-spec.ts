import { beforeEach, describe, expect, it } from '@jest/globals'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { AiQuotaService } from './ai-quota.service'
import { AiQuotaExceededException } from './ai-quota-exceeded.exception'
import { AiUsageService } from './ai-usage.service'

const NOW = new Date('2026-11-24T15:00:00Z')

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
