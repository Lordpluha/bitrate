import { PrismaModule } from '@infra/prisma/prisma.module'
import { AdminAuthModule } from '@modules/admin-auth'
import { Module } from '@nestjs/common'
import { AdminPodcastsController } from './admin-podcasts.controller'
import { AdminPodcastsService } from './admin-podcasts.service'

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [AdminPodcastsController],
  providers: [AdminPodcastsService],
})
export class AdminPodcastsModule {}
