import { CacheModule } from '@infra/cache/cache.module'
import { PrismaModule } from '@infra/prisma/prisma.module'
import { SUPPORT_RETENTION_QUEUE } from '@infra/queues/support-retention.queue'
import { TokensModule } from '@modules/tokens/tokens.module'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { SupportRetentionConsumer } from '../retention/support-retention.consumer'
import { SupportChatService } from './support-chat.service'
import { SupportConversationsController } from './support-conversations.controller'
import { SupportConversationsService } from './support-conversations.service'
import { SupportTurnService } from './support-turn.service'
import { supportTurnDepsProvider } from './support-turn-deps.provider'

/** The support assistant's web chat (#571) and the 90-day retention of its conversations. */
@Module({
  imports: [
    PrismaModule,
    CacheModule,
    // OptionalUserAuthGuard needs TokenService to read the session cookie.
    TokensModule,
    BullModule.registerQueue({ name: SUPPORT_RETENTION_QUEUE }),
  ],
  controllers: [SupportConversationsController],
  providers: [
    supportTurnDepsProvider,
    SupportTurnService,
    SupportConversationsService,
    SupportChatService,
    SupportRetentionConsumer,
  ],
  /** The messenger adapters run the same turns. */
  exports: [SupportConversationsService, SupportTurnService],
})
export class SupportChatModule {}
