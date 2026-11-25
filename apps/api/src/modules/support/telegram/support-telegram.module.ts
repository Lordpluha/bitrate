import { CacheModule } from '@infra/cache/cache.module'
import { SUPPORT_TELEGRAM_QUEUE } from '@infra/queues/support-telegram.queue'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { SupportChatModule } from '../chat/support-chat.module'
import { SupportTelegramConsumer } from './support-telegram.consumer'
import { SupportTelegramController } from './support-telegram.controller'
import { SupportTelegramService } from './support-telegram.service'
import { TelegramSender } from './telegram-sender.service'

/** The support assistant's Telegram channel (#574), in the API process. */
@Module({
  imports: [
    SupportChatModule,
    CacheModule,
    BullModule.registerQueue({ name: SUPPORT_TELEGRAM_QUEUE }),
  ],
  controllers: [SupportTelegramController],
  providers: [SupportTelegramService, TelegramSender, SupportTelegramConsumer],
})
export class SupportTelegramModule {}
