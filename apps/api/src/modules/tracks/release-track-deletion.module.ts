import { CacheModule } from '@infra/cache/cache.module'
import { Module } from '@nestjs/common'
import { ReleaseTrackDeletionService } from './release-track-deletion.service'

/** Deletion of catalogue copies without upload queues or conversion workers. */
@Module({
  imports: [CacheModule],
  providers: [ReleaseTrackDeletionService],
  exports: [ReleaseTrackDeletionService],
})
export class ReleaseTrackDeletionModule {}
