import { CacheModule } from '@infra/cache/cache.module'
import { PrismaModule } from '@infra/prisma/prisma.module'
import { StorageModule } from '@infra/storage/storage.module'
import { TokensModule } from '@modules/tokens/tokens.module'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { Module } from '@nestjs/common'
import { PlaybackSessionsModule } from './playback-sessions.module'
import { TrackPlaybackService } from './track-playback.service'
import { TracksController } from './tracks.controller'
import { TracksCoreModule } from './tracks-core.module'
import { TranscodeModule } from './transcode.module'

@Module({
  providers: [TrackPlaybackService],
  controllers: [TracksController],
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
