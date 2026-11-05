import { CacheModule } from '@infra/cache/cache.module'
import { PrismaModule } from '@infra/prisma/prisma.module'
import { StorageCoreModule } from '@infra/storage/storage-core.module'
import { Module } from '@nestjs/common'
import { AudioProcessingQueueModule } from './audio-processing-queue.module'
import { TrackUploadService } from './track-upload.service'
import { TracksService } from './tracks.service'

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
