import type { UngroundedClaim } from '../grounding'
import type { PromotionTask } from '../routing'

/** Every configured model failed at the provider; nothing usable came back. */
export class PromotionModelUnavailableError extends Error {
  constructor(task: PromotionTask, options?: ErrorOptions) {
    super(`No model could serve the "${task}" task`, options)
    this.name = 'PromotionModelUnavailableError'
  }
}

/** The output failed its schema or its grounding check twice (spec AC-5). */
export class PromotionOutputRejectedError extends Error {
  constructor(
    task: PromotionTask,
    readonly claims: readonly UngroundedClaim[],
  ) {
    super(`The "${task}" output was rejected twice`)
    this.name = 'PromotionOutputRejectedError'
  }
}
