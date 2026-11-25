import { PrismaModule } from '@infra/prisma/prisma.module'
import { SUPPORT_TELEGRAM_QUEUE } from '@infra/queues/support-telegram.queue'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { SupportInboxService } from './support-inbox.service'

/** Service-only, so the admin process can import it without the listener chat controllers. */
@Module({
  // Operator replies to Telegram are sent by the API process; this only enqueues them.
  imports: [PrismaModule, BullModule.registerQueue({ name: SUPPORT_TELEGRAM_QUEUE })],
  providers: [SupportInboxService],
  exports: [SupportInboxService],
})
export class SupportInboxModule {}
