import { PrismaModule } from '@infra/prisma/prisma.module'
import { AdminAuthModule } from '@modules/admin-auth'
import { PlaybackSessionsModule } from '@modules/tracks/playback-sessions.module'
import { Module } from '@nestjs/common'
import { AdminUsersController } from './admin-users.controller'
import { AdminUsersService } from './admin-users.service'

@Module({
  imports: [PrismaModule, AdminAuthModule, PlaybackSessionsModule],
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
})
export class AdminUsersModule {}
