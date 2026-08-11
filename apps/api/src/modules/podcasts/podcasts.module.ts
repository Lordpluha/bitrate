import { PrismaModule } from '@infra/prisma/prisma.module'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { Module } from '@nestjs/common'
import { PodcastsController } from './podcasts.controller'
import { PodcastsService } from './podcasts.service'

@Module({
  imports: [PrismaModule, UsersAuthModule],
  controllers: [PodcastsController],
  providers: [PodcastsService],
})
export class PodcastsModule {}
