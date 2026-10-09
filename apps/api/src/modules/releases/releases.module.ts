import { PrismaModule } from '@infra/prisma/prisma.module'
import { StorageCoreModule } from '@infra/storage/storage-core.module'
import { TokensModule } from '@modules/tokens/tokens.module'
import { Module } from '@nestjs/common'
import { ArtistMusicController } from './artist-music.controller'
import { ArtistMusicService } from './artist-music.service'
import { ReleaseMediaController } from './release-media.controller'
import { ReleaseMediaService } from './release-media.service'
import { ArtistTasksController, ReleaseTasksController } from './release-tasks.controller'
import { ReleaseTasksService } from './release-tasks.service'
import { ReleasesController } from './releases.controller'
import { ReleasesService } from './releases.service'

@Module({
  imports: [PrismaModule, StorageCoreModule, TokensModule],
  controllers: [
    ReleasesController,
    ReleaseMediaController,
    ReleaseTasksController,
    ArtistTasksController,
    ArtistMusicController,
  ],
  providers: [ReleasesService, ReleaseMediaService, ReleaseTasksService, ArtistMusicService],
})
export class ReleasesModule {}
