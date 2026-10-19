import { PrismaModule } from '@infra/prisma/prisma.module'
import { Module } from '@nestjs/common'
import { NotificationsConsumer } from './notifications.consumer'
import { NotificationsService } from './notifications.service'
import { NotificationsQueueModule } from './notifications-queue.module'

/** Consumes the notifications queue in the API process and writes the rows. */
@Module({
  imports: [PrismaModule, NotificationsQueueModule],
  providers: [NotificationsService, NotificationsConsumer],
})
export class NotificationsModule {}
