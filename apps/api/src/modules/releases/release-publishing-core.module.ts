import { PrismaModule } from '@infra/prisma/prisma.module'
import { RELEASE_PUBLISHING_QUEUE } from '@infra/queues/release-publishing.queue'
import { AlbumsCoreModule } from '@modules/albums/albums-core.module'
import { NotificationsQueueModule } from '@modules/notifications'
import { TracksCoreModule } from '@modules/tracks/tracks-core.module'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ReleasePublishingService } from './release-publishing.service'

/**
 * `ReleasePublishingService` and its queue as a producer, without the artist routes or the
 * consumer, so the operator process can publish releases without running either (#458).
 */
@Module({
  imports: [
    PrismaModule,
    TracksCoreModule,
    AlbumsCoreModule,
    NotificationsQueueModule,
    BullModule.registerQueue({ name: RELEASE_PUBLISHING_QUEUE }),
  ],
  providers: [ReleasePublishingService],
  exports: [ReleasePublishingService],
})
export class ReleasePublishingCoreModule {}
