import { PrismaModule } from '@infra/prisma/prisma.module'
import { TokensModule } from '@modules/tokens/tokens.module'
import { Module } from '@nestjs/common'
import { ArtistMusicController } from './artist-music.controller'
import { ArtistMusicService } from './artist-music.service'
import { ReleasesController } from './releases.controller'
import { ReleasesService } from './releases.service'

@Module({
  imports: [PrismaModule, TokensModule],
  controllers: [ReleasesController, ArtistMusicController],
  providers: [ReleasesService, ArtistMusicService],
})
export class ReleasesModule {}
