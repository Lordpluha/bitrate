import { Inject, Injectable } from '@nestjs/common'
import { AiQuotaExceededException } from './ai-quota-exceeded.exception'
import { AI_QUOTA_LIMITS, type AiAllowance, type AiQuotaLimits } from './ai-quota-limits'
import { AiUsageService } from './ai-usage.service'
import { monthStart } from './month-start'

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
