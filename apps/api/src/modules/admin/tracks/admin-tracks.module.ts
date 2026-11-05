import { PrismaModule } from '@infra/prisma/prisma.module'
import { StorageCoreModule } from '@infra/storage/storage-core.module'
import { AdminAuthModule } from '@modules/admin-auth'
import { TracksCoreModule } from '@modules/tracks'
import { Module } from '@nestjs/common'
import { AdminTrackAudioService } from './admin-track-audio.service'
import { AdminTrackListService } from './admin-track-list.service'
import { AdminTracksController } from './admin-tracks.controller'
import { AdminTracksService } from './admin-tracks.service'

@Module({
  imports: [PrismaModule, AdminAuthModule, TracksCoreModule, StorageCoreModule],
  controllers: [AdminTracksController],
  providers: [AdminTrackListService, AdminTracksService, AdminTrackAudioService],
})
export class AdminTracksModule {}
