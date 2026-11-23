import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import type { AiCallOutcome } from '@prisma/client'
import type { ModelRef, PromotionTask } from '../ai/model-routing'
import { costMicroUsd, type TokenUsage } from '../ai/pricing'

/** The feature name written to `AiUsage.feature` for every promotion call. */
export const PROMOTION_FEATURE = 'promotion'

export interface AiCallRecord {
  artistId: string
  task: PromotionTask
  model: ModelRef
  usage: TokenUsage
  outcome: AiCallOutcome
}

/** First instant of the calendar month (UTC) that contains `now`. */
export const monthStart = (now: Date) =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))

/** Writes one `AiUsage` row per billed model call and sums an artist's monthly spend. */
@Injectable()
export class AiUsageService {
  constructor(private readonly prisma: PrismaService) {}

  /** Records a call and returns its cost in micro-dollars. */
  async record({ artistId, task, model, usage, outcome }: AiCallRecord): Promise<number> {
    const cost = costMicroUsd(model, usage)
    await this.prisma.aiUsage.create({
      data: {
        artistId,
        feature: PROMOTION_FEATURE,
        task,
        provider: model.provider,
        model: model.modelId,
        inputTokens: usage.inputTokens,
        cachedInputTokens: usage.cachedInputTokens,
        outputTokens: usage.outputTokens,
        costMicroUsd: cost,
        outcome,
      },
    })
    return cost
  }

  /** What the artist's AI calls cost in the current calendar month (UTC), in micro-dollars. */
  async monthCostMicroUsd(artistId: string, now: Date): Promise<number> {
    const { _sum } = await this.prisma.aiUsage.aggregate({
      where: { artistId, createdAt: { gte: monthStart(now) } },
      _sum: { costMicroUsd: true },
    })
    return _sum.costMicroUsd ?? 0
  }
}
