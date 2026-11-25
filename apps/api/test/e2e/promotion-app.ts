import { appConfigs } from '@common/config'
import { API_RATE_LIMITS } from '@common/config/rate-limit.config'
import { CacheModule } from '@infra/cache/cache.module'
import { ObservabilityModule } from '@infra/observability/observability.module'
import { PrismaService } from '@infra/prisma/prisma.service'
import { StorageModule } from '@infra/storage/storage.module'
import { ArtistsAuthModule } from '@modules/artists-auth/artists-auth.module'
import { PROMOTION_MODELS, type PromotionModels } from '@modules/promotion/ai/generator'
import { parseModelRef } from '@modules/promotion/ai/routing'
import { PromotionModule } from '@modules/promotion/promotion.module'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { ThrottlerModule } from '@nestjs/throttler'
import { MockLanguageModelV4 } from 'ai/test'
import cookieParser from 'cookie-parser'
import { envSchema } from '../../env.schema'

/** Artist auth plus AI promotion, as the API wires them, without the rest of the catalogue. */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.test',
      load: appConfigs,
      validate: (env) => envSchema.parse(env),
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),
    ThrottlerModule.forRoot({ throttlers: API_RATE_LIMITS }),
    CacheModule,
    StorageModule,
    ObservabilityModule,
    ArtistsAuthModule,
    PromotionModule,
  ],
})
class PromotionE2eModule {}

const usage = {
  inputTokens: { total: 1_000, noCache: 1_000, cacheRead: undefined, cacheWrite: undefined },
  outputTokens: { total: 400, text: 400, reasoning: undefined },
}

/** A model that always answers with `output` as JSON, standing in for every provider. */
const fakeModel = (output: () => unknown) =>
  new MockLanguageModelV4({
    doGenerate: () =>
      Promise.resolve({
        content: [{ type: 'text' as const, text: JSON.stringify(output()) }],
        finishReason: { unified: 'stop' as const, raw: undefined },
        usage,
        warnings: [],
      }),
  })

/** The promotion API with a fake model behind every task route (no provider is called). */
export const createPromotionE2eApp = async (output: () => unknown) => {
  const route = { primary: parseModelRef('anthropic:claude-sonnet-5-5'), fallback: null }
  const models: PromotionModels = {
    routes: { plan: route, copy: route, translate: route, check: route },
    languageModel: () => fakeModel(output),
  }
  const moduleFixture = await Test.createTestingModule({ imports: [PromotionE2eModule] })
    .overrideProvider(PROMOTION_MODELS)
    .useValue(models)
    .compile()
  const app = moduleFixture.createNestApplication()
  app.use(cookieParser())
  await app.init()
  return { app, prisma: app.get(PrismaService) }
}
