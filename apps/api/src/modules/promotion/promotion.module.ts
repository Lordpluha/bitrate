import type { AppConfig } from '@common/config'
import { PrismaModule } from '@infra/prisma/prisma.module'
import { TokensModule } from '@modules/tokens/tokens.module'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createPromotionModels, PROMOTION_MODELS, PromotionGenerator } from './ai/generator'
import { readPromotionModelConfig } from './ai/routing'
import {
  GeneratePlanService,
  PlanViewService,
  RequestPlanService,
  UpdateStepService,
} from './plans'
import {
  GeneratePostsService,
  LlmTranslator,
  PostsViewService,
  RequestPostsService,
  RequestTranslationService,
  RunTranslationService,
  TRANSLATOR,
  UpdatePostService,
  UpdateTranslationService,
} from './posts'
import { PromotionProfileService } from './profile/promotion-profile.service'
import { PromotionConsumer } from './promotion.consumer'
import { PromotionController } from './promotion.controller'
import { PROMOTION_QUEUE } from './promotion.queue'
import { PromotionPostsController } from './promotion-posts.controller'
import { AI_QUOTA_LIMITS, type AiQuotaLimits, AiQuotaService, AiUsageService } from './usage'

type Env = ConfigService<AppConfig>

/** Matches the env schema default; used only if the value was not validated in. */
const DEFAULT_MONTHLY_LIMIT_USD = 2

/**
 * AI promotion (spec ai-artist-promotion, ADR-0076): model routing and generation with grounding
 * checks, per-artist usage and quotas, the promotion profile and per-release plans.
 */
@Module({
  imports: [PrismaModule, TokensModule, BullModule.registerQueue({ name: PROMOTION_QUEUE })],
  controllers: [PromotionController, PromotionPostsController],
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
    PromotionProfileService,
    PlanViewService,
    RequestPlanService,
    GeneratePlanService,
    UpdateStepService,
    PostsViewService,
    RequestPostsService,
    GeneratePostsService,
    UpdatePostService,
    RequestTranslationService,
    RunTranslationService,
    UpdateTranslationService,
    LlmTranslator,
    { provide: TRANSLATOR, useExisting: LlmTranslator },
    PromotionConsumer,
  ],
  exports: [PromotionGenerator, AiQuotaService],
})
export class PromotionModule {}
