import { PrismaModule } from '@infra/prisma/prisma.module'
import { StorageCoreModule } from '@infra/storage/storage-core.module'
import { AlbumsCoreModule } from '@modules/albums/albums-core.module'
import { TracksCoreModule } from '@modules/tracks/tracks-core.module'
import { Module } from '@nestjs/common'
import { ReleaseChangeReviewService } from './release-change-review.service'
import { ReleaseChangesService } from './release-changes.service'

/** Staff review of changes to published releases, without the artist routes, for the admin area. */
@Module({
  imports: [PrismaModule, StorageCoreModule, AlbumsCoreModule, TracksCoreModule],
  providers: [ReleaseChangeReviewService, ReleaseChangesService],
  exports: [ReleaseChangeReviewService, ReleaseChangesService],
})
export class ReleaseChangeReviewModule {}
