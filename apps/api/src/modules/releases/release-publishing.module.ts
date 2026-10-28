import { PrismaModule } from '@infra/prisma/prisma.module'
import { RELEASE_PUBLISHING_QUEUE } from '@infra/queues/release-publishing.queue'
import { AlbumsModule } from '@modules/albums/albums.module'
import { NotificationsQueueModule } from '@modules/notifications'
import { TokensModule } from '@modules/tokens/tokens.module'
import { TracksModule } from '@modules/tracks/tracks.module'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ReleasePublishingConsumer } from './release-publishing.consumer'
import { ReleasePublishingController } from './release-publishing.controller'
import { ReleasePublishingService } from './release-publishing.service'

/**
 * Publication of approved releases on Bitrate. Kept apart from `ReleasesModule` because it
 * writes the player catalogue through the tracks and albums modules and runs a queue, which the
 * preparation workspace does not need.
 */
@Module({
  imports: [
    PrismaModule,
    TokensModule,
    TracksModule,
    AlbumsModule,
    NotificationsQueueModule,
    BullModule.registerQueue({ name: RELEASE_PUBLISHING_QUEUE }),
  ],
  controllers: [ReleasePublishingController],
  providers: [ReleasePublishingService, ReleasePublishingConsumer],
  exports: [ReleasePublishingService],
})
export class ReleasePublishingModule {}
