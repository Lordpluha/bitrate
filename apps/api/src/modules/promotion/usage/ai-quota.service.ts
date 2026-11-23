import { TranslatableException } from '@common/exceptions'
import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import { AiUsageService, monthStart } from './ai-usage.service'

/** Monthly AI spending ceilings in micro-dollars (spec: Free $2 hard, Artist $5 soft). */
export interface AiQuotaLimits {
  freeMicroUsd: number
}
export const AI_QUOTA_LIMITS = Symbol('AI_QUOTA_LIMITS')

/** The artist used this month's AI allowance; it resets at the start of the next UTC month. */
export class AiQuotaExceededException extends TranslatableException {
  constructor(resetsAt: Date) {
    super('errors.promotion.ai_quota_exceeded', HttpStatus.PAYMENT_REQUIRED, {
      resetsAt: resetsAt.toISOString().slice(0, 10),
    })
  }
}

export interface AiAllowance {
  usedMicroUsd: number
  limitMicroUsd: number
  resetsAt: Date
}

/**
 * Checks an artist's monthly AI allowance before a generation job is queued. Billing does not
 * exist yet, so every artist is on the Free ceiling; the Artist plan's soft ceiling is added
 * with payments.
 */
@Injectable()
export class AiQuotaService {
  constructor(
    private readonly usage: AiUsageService,
    @Inject(AI_QUOTA_LIMITS) private readonly limits: AiQuotaLimits,
  ) {}

  async allowance(artistId: string, now = new Date()): Promise<AiAllowance> {
    const start = monthStart(now)
    return {
      usedMicroUsd: await this.usage.monthCostMicroUsd(artistId, now),
      limitMicroUsd: this.limits.freeMicroUsd,
      resetsAt: new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1)),
    }
  }

  /** Throws `AiQuotaExceededException` when the artist has nothing left this month. */
  async assertAvailable(artistId: string, now = new Date()): Promise<void> {
    const { usedMicroUsd, limitMicroUsd, resetsAt } = await this.allowance(artistId, now)
    if (usedMicroUsd >= limitMicroUsd) throw new AiQuotaExceededException(resetsAt)
  }
}
