import { Inject, Injectable, Logger } from '@nestjs/common'
import type { AiCallOutcome } from '@prisma/client'
import { generateText, NoObjectGeneratedError, Output } from 'ai'
import { AiUsageService } from '../../usage/ai-usage.service'
import { findUngroundedClaims, type UngroundedClaim } from '../grounding'
import type { TokenUsage } from '../pricing'
import type { ModelRef } from '../routing'
import { PromotionModelUnavailableError, PromotionOutputRejectedError } from './generation-errors'
import type { GenerationRequest, GenerationResult } from './generation-request'
import { PROMOTION_MODELS, type PromotionModels } from './promotion-models'
import { toTokenUsage } from './to-token-usage'

/** A model may produce at most this many outputs per request: the first and one regeneration. */
const MAX_OUTPUTS = 2

type Attempt<T> =
  | { kind: 'ok'; output: T; usage: TokenUsage }
  | { kind: 'schema'; usage: TokenUsage }
  | { kind: 'provider'; usage: TokenUsage; error: unknown }

const NO_USAGE: TokenUsage = { inputTokens: 0, cachedInputTokens: 0, outputTokens: 0 }

const correctionFor = (claims: readonly UngroundedClaim[]) =>
  claims.length === 0
    ? ''
    : `\n\nYour previous answer stated facts that are not in the context: ${claims
        .map((claim) => `"${claim.value}"`)
        .join(', ')}. Remove them and use only the context.`

/**
 * Runs one promotion model task (ADR-0076): the configured model, then its fallback when the
 * provider fails; output must match its schema and contain only facts from the context, with
 * one regeneration allowed. Every attempt, failed or not, is written to `AiUsage`.
 */
@Injectable()
export class PromotionGenerator {
  private readonly logger = new Logger(PromotionGenerator.name)

  constructor(
    /** `null` while `PROMOTION_AI_ENABLED` is off: every task is then unavailable. */
    @Inject(PROMOTION_MODELS) private readonly models: PromotionModels | null,
    private readonly usage: AiUsageService,
  ) {}

  async generate<T>(request: GenerationRequest<T>): Promise<GenerationResult<T>> {
    if (!this.models) throw new PromotionModelUnavailableError(request.task)
    const route = this.models.routes[request.task]
    const refs = route.fallback ? [route.primary, route.fallback] : [route.primary]
    let outputs = 0
    let lastClaims: readonly UngroundedClaim[] = []
    let providerError: unknown

    for (const ref of refs) {
      while (outputs < MAX_OUTPUTS) {
        const attempt = await this.attempt(this.models, ref, request, lastClaims)
        if (attempt.kind === 'provider') {
          await this.record(request, ref, attempt.usage, 'FAILED')
          providerError = attempt.error
          this.logger.warn(`Model ${ref.id} failed for task ${request.task}`)
          break // try the fallback
        }
        outputs++
        if (attempt.kind === 'schema') {
          await this.record(request, ref, attempt.usage, 'REJECTED_SCHEMA')
          lastClaims = []
          continue
        }
        const claims = [
          ...findUngroundedClaims(request.textOf(attempt.output), request.facts),
          ...(request.check?.(attempt.output) ?? []),
        ]
        if (claims.length > 0) {
          await this.record(request, ref, attempt.usage, 'REJECTED_UNGROUNDED')
          lastClaims = claims
          continue
        }
        await this.record(request, ref, attempt.usage, 'SUCCEEDED')
        return { output: attempt.output, model: ref.id }
      }
      if (outputs >= MAX_OUTPUTS) throw new PromotionOutputRejectedError(request.task, lastClaims)
    }
    throw new PromotionModelUnavailableError(request.task, { cause: providerError })
  }

  private async attempt<T>(
    models: PromotionModels,
    ref: ModelRef,
    request: GenerationRequest<T>,
    claims: readonly UngroundedClaim[],
  ): Promise<Attempt<T>> {
    try {
      const result = await generateText({
        model: models.languageModel(ref),
        system: request.system,
        prompt: request.prompt + correctionFor(claims),
        output: Output.object({ schema: request.schema }),
      })
      return { kind: 'ok', output: result.output, usage: toTokenUsage(result.usage) }
    } catch (error: unknown) {
      if (NoObjectGeneratedError.isInstance(error)) {
        return { kind: 'schema', usage: error.usage ? toTokenUsage(error.usage) : NO_USAGE }
      }
      return { kind: 'provider', usage: NO_USAGE, error }
    }
  }

  private async record<T>(
    request: GenerationRequest<T>,
    model: ModelRef,
    usage: TokenUsage,
    outcome: AiCallOutcome,
  ) {
    await this.usage.record({
      artistId: request.artistId,
      task: request.task,
      model,
      usage,
      outcome,
    })
  }
}
