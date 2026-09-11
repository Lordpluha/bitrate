import { PrismaModule } from '@infra/prisma/prisma.module'
import { AdminAuthModule } from '@modules/admin-auth'
import { TracksModule } from '@modules/tracks'
import { Module } from '@nestjs/common'
import { AdminTracksController } from './admin-tracks.controller'
import { AdminTracksService } from './admin-tracks.service'

@Module({
  imports: [PrismaModule, AdminAuthModule, TracksModule],
  controllers: [AdminTracksController],
  providers: [AdminTracksService],
})
export class AdminTracksModule {}
