import { CacheModule } from '@infra/cache/cache.module'
import { PrismaModule } from '@infra/prisma/prisma.module'
import { StorageModule } from '@infra/storage/storage.module'
import { TokensModule } from '@modules/tokens/tokens.module'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { Module } from '@nestjs/common'
import { AudioGateway } from './audio.gateway'
import { TrackPlaybackService } from './track-playback.service'
import { TrackStreamingService } from './track-streaming.service'
import { TrackUploadService } from './track-upload.service'
import { TracksController } from './tracks.controller'
import { TracksService } from './tracks.service'
import { TranscodeModule } from './transcode.module'

@Module({
  providers: [
    TracksService,
    TrackUploadService,
    TrackStreamingService,
    TrackPlaybackService,
    AudioGateway,
  ],
  controllers: [TracksController],
  imports: [
    PrismaModule,
    CacheModule,
    UsersAuthModule,
    TokensModule,
    StorageModule,
    TranscodeModule,
  ],
  exports: [
    TracksService,
    TrackUploadService,
    TrackStreamingService,
    TrackPlaybackService,
    AudioGateway,
  ],
})
export class TracksModule {}
