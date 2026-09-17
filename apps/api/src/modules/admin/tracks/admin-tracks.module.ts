import { PrismaModule } from '@infra/prisma/prisma.module'
import { StorageModule } from '@infra/storage/storage.module'
import { AdminAuthModule } from '@modules/admin-auth'
import { TracksModule } from '@modules/tracks'
import { Module } from '@nestjs/common'
import { AdminTrackAudioService } from './admin-track-audio.service'
import { AdminTracksController } from './admin-tracks.controller'
import { AdminTracksService } from './admin-tracks.service'

@Module({
  imports: [PrismaModule, AdminAuthModule, TracksModule, StorageModule],
  controllers: [AdminTracksController],
  providers: [AdminTracksService, AdminTrackAudioService],
})
export class AdminTracksModule {}
