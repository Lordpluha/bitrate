import { PrismaModule } from '@infra/prisma/prisma.module'
import { AdminAuditModule } from '@modules/admin/audit'
import { AdminAuthModule } from '@modules/admin-auth'
import { Module } from '@nestjs/common'
import { AdminOverviewController } from './admin-overview.controller'
import { AdminOverviewService } from './admin-overview.service'

@Module({
  imports: [PrismaModule, AdminAuthModule, AdminAuditModule],
  controllers: [AdminOverviewController],
  providers: [AdminOverviewService],
})
export class AdminOverviewModule {}
