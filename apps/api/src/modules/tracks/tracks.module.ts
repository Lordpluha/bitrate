import { CacheModule } from '@infra/cache/cache.module'
import { PrismaModule } from '@infra/prisma/prisma.module'
import { StorageModule } from '@infra/storage/storage.module'
import { TokensModule } from '@modules/tokens/tokens.module'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { Module } from '@nestjs/common'
import { TracksController } from './catalog/tracks.controller'
import { PlaybackSessionsModule } from './playback/playback-sessions.module'
import { TrackPlaybackController } from './playback/track-playback.controller'
import { TrackPlaybackService } from './playback/track-playback.service'
import { TranscodeModule } from './processing/transcode.module'
import { TracksCoreModule } from './tracks-core.module'

@Module({
  providers: [TrackPlaybackService],
  controllers: [TracksController, TrackPlaybackController],
  imports: [
    PrismaModule,
    CacheModule,
    UsersAuthModule,
    TokensModule,
    StorageModule,
    TracksCoreModule,
    TranscodeModule,
    PlaybackSessionsModule,
  ],
  exports: [TracksCoreModule, TrackPlaybackService],
})
export class TracksModule {}
