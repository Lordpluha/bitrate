import { PrismaModule } from '@infra/prisma/prisma.module'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { Module } from '@nestjs/common'
import { ModerationController } from './moderation.controller'
import { ModerationService } from './moderation.service'

@Module({
  imports: [PrismaModule, UsersAuthModule],
  controllers: [ModerationController],
  providers: [ModerationService],
})
export class ModerationModule {}
