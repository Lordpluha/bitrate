import { TranslatableException } from '@common/exceptions'
import { HttpStatus } from '@nestjs/common'

/** The artist used this month's AI allowance; it resets at the start of the next UTC month. */
export class AiQuotaExceededException extends TranslatableException {
  constructor(resetsAt: Date) {
    super('errors.promotion.ai_quota_exceeded', HttpStatus.PAYMENT_REQUIRED, {
      resetsAt: resetsAt.toISOString().slice(0, 10),
    })
  }
}
