import { Inject, Injectable, Logger } from '@nestjs/common'
import type { AiCallOutcome } from '@prisma/client'
import { generateText, type LanguageModel, NoObjectGeneratedError, Output } from 'ai'
import type { z } from 'zod'
import type { AiUsageService } from '../usage/ai-usage.service'
import { findUngroundedClaims, type UngroundedClaim } from './grounding'
import type { ModelRef, PromotionRoutes, PromotionTask } from './model-routing'
import type { TokenUsage } from './pricing'

/** Resolved routes plus a way to turn a route into an AI SDK model; built once at startup. */
export interface PromotionModels {
  routes: PromotionRoutes
  languageModel(ref: ModelRef): LanguageModel
}
export const PROMOTION_MODELS = Symbol('PROMOTION_MODELS')

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
}

export interface GenerationResult<T> {
  output: T
  /** The `provider:model` id that produced the output. */
  model: string
}

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

/** A model may produce at most this many outputs per request: the first and one regeneration. */
const MAX_OUTPUTS = 2

type Attempt<T> =
  | { kind: 'ok'; output: T; usage: TokenUsage }
  | { kind: 'schema'; usage: TokenUsage }
  | { kind: 'provider'; usage: TokenUsage; error: unknown }

const NO_USAGE: TokenUsage = { inputTokens: 0, cachedInputTokens: 0, outputTokens: 0 }

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
        const claims = findUngroundedClaims(request.textOf(attempt.output), request.facts)
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
    const correction =
      claims.length > 0
        ? `\n\nYour previous answer stated facts that are not in the context: ${claims
            .map((claim) => `"${claim.value}"`)
            .join(', ')}. Remove them and use only the context.`
        : ''
    try {
      const result = await generateText({
        model: models.languageModel(ref),
        system: request.system,
        prompt: request.prompt + correction,
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

/** AI SDK usage → billed token counts; cached input is billed at its own rate. */
export function toTokenUsage(usage: {
  inputTokens?: number | undefined
  outputTokens?: number | undefined
  inputTokenDetails?: { cacheReadTokens?: number | undefined } | undefined
}): TokenUsage {
  const input = usage.inputTokens ?? 0
  const cached = usage.inputTokenDetails?.cacheReadTokens ?? 0
  return {
    inputTokens: Math.max(input - cached, 0),
    cachedInputTokens: cached,
    outputTokens: usage.outputTokens ?? 0,
  }
}
