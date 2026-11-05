import { TokensModule } from '@modules/tokens/tokens.module'
import { Module } from '@nestjs/common'
import { ReleasePublishingConsumer } from './release-publishing.consumer'
import { ReleasePublishingController } from './release-publishing.controller'
import { ReleasePublishingCoreModule } from './release-publishing-core.module'

/**
 * Publication of approved releases on Bitrate. Kept apart from `ReleasesModule` because it
 * writes the player catalogue through the tracks and albums modules and runs a queue, which the
 * preparation workspace does not need. The service lives in `ReleasePublishingCoreModule`; this
 * module adds the artist routes and the consumer.
 */
@Module({
  imports: [ReleasePublishingCoreModule, TokensModule],
  controllers: [ReleasePublishingController],
  providers: [ReleasePublishingConsumer],
  exports: [ReleasePublishingCoreModule],
})
export class ReleasePublishingModule {}
