import type { AppConfig } from '@common/config'
import { REDIS_CLIENT } from '@infra/cache/cache.constants'
import { PrismaService } from '@infra/prisma/prisma.service'
import type { FactoryProvider } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Redis } from 'ioredis'
import { loadSupportCore } from '../knowledge/load-support-core'
import { createSupportResponder } from './create-support-responder'
import { PrismaSupportTurnStore } from './prisma-support-turn.store'
import { RedisSupportBudget } from './redis-support-budget'
import { readSupportChatConfig } from './support-chat-config'
import { SUPPORT_CONVERSATION_TOKEN_CAP } from './support-limits'
import { SUPPORT_TURN_DEPS, type SupportTurnDeps } from './support-turn-deps'

/** Wires a turn to Prisma, the Redis budget and, when configured, the support agent. */
export const supportTurnDepsProvider: FactoryProvider<Promise<SupportTurnDeps>> = {
  provide: SUPPORT_TURN_DEPS,
  inject: [ConfigService, PrismaService, REDIS_CLIENT],
  useFactory: async (
    configService: ConfigService<AppConfig>,
    prisma: PrismaService,
    redis: Redis,
  ): Promise<SupportTurnDeps> => {
    const config = readSupportChatConfig(configService)
    return {
      store: new PrismaSupportTurnStore(prisma),
      budget: new RedisSupportBudget(
        redis,
        configService.getOrThrow('SUPPORT_CHAT_MODEL'),
        configService.getOrThrow('SUPPORT_MONTHLY_BUDGET_USD'),
      ),
      responder: config ? await createSupportResponder(config) : undefined,
      handoffText: async (locale) => (await loadSupportCore()).FIXED_TEXTS[locale].handoff,
      conversationTokenCap: SUPPORT_CONVERSATION_TOKEN_CAP,
    }
  },
}
