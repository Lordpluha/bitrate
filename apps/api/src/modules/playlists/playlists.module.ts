import { PrismaModule } from '@infra/prisma/prisma.module'
import { AuthModule } from '@modules/auth/auth.module'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PlaylistsController } from './playlists.controller'
import { PlaylistsService } from './playlists.service'

@Module({
  controllers: [PlaylistsController],
  providers: [PlaylistsService],
  imports: [PrismaModule, JwtModule, AuthModule],
  exports: [PlaylistsService],
})
export class PlaylistsModule {}
