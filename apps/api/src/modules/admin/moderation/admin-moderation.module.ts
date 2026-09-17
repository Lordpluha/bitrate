import { PrismaModule } from '@infra/prisma/prisma.module'
import { AdminAuthModule } from '@modules/admin-auth'
import { Module } from '@nestjs/common'
import { AdminModerationController } from './admin-moderation.controller'
import { AdminModerationService } from './admin-moderation.service'

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [AdminModerationController],
  providers: [AdminModerationService],
})
export class AdminModerationModule {}
