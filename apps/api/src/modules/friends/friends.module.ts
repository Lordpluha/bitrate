import { PrismaModule } from '@infra/prisma/prisma.module'
import { NotificationsQueueModule } from '@modules/notifications'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { Module } from '@nestjs/common'
import { FriendsController } from './friends.controller'
import { FriendsService } from './friends.service'

@Module({
  providers: [FriendsService],
  controllers: [FriendsController],
  imports: [PrismaModule, NotificationsQueueModule, UsersAuthModule],
})
export class FriendsModule {}
