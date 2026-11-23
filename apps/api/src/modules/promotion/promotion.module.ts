import type { AppConfig } from '@common/config'
import { PrismaModule } from '@infra/prisma/prisma.module'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createPromotionModels, PROMOTION_MODELS, PromotionGenerator } from './ai/generator'
import { readPromotionModelConfig } from './ai/routing'
import { AI_QUOTA_LIMITS, type AiQuotaLimits, AiQuotaService, AiUsageService } from './usage'

type Env = ConfigService<AppConfig>

/** Matches the env schema default; used only if the value was not validated in. */
const DEFAULT_MONTHLY_LIMIT_USD = 2

/**
 * AI promotion foundation (spec ai-artist-promotion, ADR-0076): model routing, generation with
 * grounding checks, and per-artist usage accounting and quotas. The plan, post and translation
 * features build on `PromotionGenerator` and `AiQuotaService`.
 */
@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: PROMOTION_MODELS,
      inject: [ConfigService],
      useFactory: (env: Env) =>
        env.get('PROMOTION_AI_ENABLED') === true
          ? createPromotionModels(
              readPromotionModelConfig((key) => env.get(key)),
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
