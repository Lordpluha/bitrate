import { PrismaModule } from '@infra/prisma/prisma.module'
import { AdminAuthModule } from '@modules/admin-auth'
import { Module } from '@nestjs/common'
import { AdminPlaylistsController } from './admin-playlists.controller'
import { AdminPlaylistsService } from './admin-playlists.service'

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [AdminPlaylistsController],
  providers: [AdminPlaylistsService],
})
export class AdminPlaylistsModule {}
