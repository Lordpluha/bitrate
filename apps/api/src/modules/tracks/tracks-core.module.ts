import { CacheModule } from '@infra/cache/cache.module'
import { PrismaModule } from '@infra/prisma/prisma.module'
import { StorageCoreModule } from '@infra/storage/storage-core.module'
import { Module } from '@nestjs/common'
import { TracksService } from './catalog/tracks.service'
import { TrackUploadService } from './ingest/track-upload.service'
import { AudioProcessingQueueModule } from './processing/audio-processing-queue.module'

/**
 * The tracks services without controllers, auth or the conversion consumer, so the operator
 * process can use them without registering the listener routes (#458). `TracksModule` adds the
 * HTTP surface on top.
 */
@Module({
  imports: [PrismaModule, CacheModule, StorageCoreModule, AudioProcessingQueueModule],
  providers: [TracksService, TrackUploadService],
  exports: [TracksService, TrackUploadService],
})
export class TracksCoreModule {}
