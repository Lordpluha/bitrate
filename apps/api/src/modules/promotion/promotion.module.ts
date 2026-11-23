import type { AppConfig } from '@common/config'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PROMOTION_TASKS, type PromotionModelConfig } from './ai/model-routing'
import { PROMOTION_MODELS, PromotionGenerator } from './ai/promotion-generator'
import { createPromotionModels } from './ai/promotion-models'
import { AI_QUOTA_LIMITS, type AiQuotaLimits, AiQuotaService } from './usage/ai-quota.service'
import { AiUsageService } from './usage/ai-usage.service'

type Env = ConfigService<AppConfig>

/** Matches the env schema default; used only if the value was not validated in. */
const DEFAULT_MONTHLY_LIMIT_USD = 2

const MODEL_ENV = {
  plan: ['PROMOTION_MODEL_PLAN', 'PROMOTION_MODEL_PLAN_FALLBACK'],
  copy: ['PROMOTION_MODEL_COPY', 'PROMOTION_MODEL_COPY_FALLBACK'],
  translate: ['PROMOTION_MODEL_TRANSLATE', 'PROMOTION_MODEL_TRANSLATE_FALLBACK'],
  check: ['PROMOTION_MODEL_CHECK', 'PROMOTION_MODEL_CHECK_FALLBACK'],
} as const satisfies PromotionModelConfigKeys

type PromotionModelConfigKeys = Record<
  (typeof PROMOTION_TASKS)[number],
  readonly [keyof AppConfig, keyof AppConfig]
>

/** Reads the per-task model ids; an empty fallback means the task has none. */
export function promotionModelConfig(
  read: (key: keyof AppConfig) => unknown,
): PromotionModelConfig {
  const config = {} as PromotionModelConfig
  for (const task of PROMOTION_TASKS) {
    const [primary, fallback] = MODEL_ENV[task]
    const fallbackId = String(read(fallback) ?? '').trim()
    config[task] = { primary: String(read(primary)), fallback: fallbackId || undefined }
  }
  return config
}

/**
 * AI promotion foundation (spec ai-artist-promotion, ADR-0076): model routing, generation with
 * grounding checks, and per-artist usage accounting and quotas. The plan, post and translation
 * features build on `PromotionGenerator` and `AiQuotaService`.
 */
@Module({
  providers: [
    {
      provide: PROMOTION_MODELS,
      inject: [ConfigService],
      useFactory: (env: Env) =>
        env.get('PROMOTION_AI_ENABLED') === true
          ? createPromotionModels(
              promotionModelConfig((key) => env.get(key)),
              {
                anthropicApiKey: env.get('ANTHROPIC_API_KEY'),
                mistralApiKey: env.get('MISTRAL_API_KEY'),
              },
            )
          : null,
    },
    {
      provide: AI_QUOTA_LIMITS,
      inject: [ConfigService],
      useFactory: (env: Env): AiQuotaLimits => ({
        freeMicroUsd: Math.round(
          (env.get('PROMOTION_AI_MONTHLY_LIMIT_USD') ?? DEFAULT_MONTHLY_LIMIT_USD) * 1e6,
        ),
      }),
    },
    AiUsageService,
    AiQuotaService,
    PromotionGenerator,
  ],
  exports: [PromotionGenerator, AiQuotaService],
})
export class PromotionModule {}
