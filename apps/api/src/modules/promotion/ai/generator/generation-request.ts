import type { z } from 'zod'
import type { UngroundedClaim } from '../grounding'
import type { PromotionTask } from '../routing'

export interface GenerationRequest<T> {
  artistId: string
  task: PromotionTask
  schema: z.ZodType<T>
  /** Stable instructions; kept first so providers can cache them. */
  system: string
  /** The generation context and the request. */
  prompt: string
  /** Every fact the output may state (release, profile, bio), for the grounding check. */
  facts: readonly string[]
  /** The human-readable text of an output, which the grounding check reads. */
  textOf(output: T): string
  /** Extra problems in an output (e.g. dropped glossary terms); they trigger the regeneration. */
  check?(output: T): readonly UngroundedClaim[]
}

export interface GenerationResult<T> {
  output: T
  /** The `provider:model` id that produced the output. */
  model: string
}
