import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthModule } from 'src/auth/auth.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import { PlaylistsController } from './playlists.controller'
import { PlaylistsService } from './playlists.service'

@Module({
  controllers: [PlaylistsController],
  providers: [PlaylistsService],
  imports: [PrismaModule, JwtModule, AuthModule],
  exports: [PlaylistsService],
})
export class PlaylistsModule {}
