import { PrismaModule } from '@infra/prisma/prisma.module'
import { AdminAuthModule } from '@modules/admin-auth'
import { Module } from '@nestjs/common'
import { AdminAuditController } from './admin-audit.controller'
import { AdminAuditService } from './admin-audit.service'

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [AdminAuditController],
  providers: [AdminAuditService],
})
export class AdminAuditModule {}
