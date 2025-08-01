import { Module } from '@nestjs/common'
import { PlaylistsController } from './playlists.controller'
import { PlaylistsService } from './playlists.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { JwtModule } from '@nestjs/jwt'

@Module({
  controllers: [PlaylistsController],
  providers: [PlaylistsService],
  imports: [PrismaModule, JwtModule],
  exports: [PlaylistsService]
})
export class PlaylistsModule {}
