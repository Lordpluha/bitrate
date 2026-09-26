import { PrismaModule } from '@infra/prisma/prisma.module'
import { AdminAuthModule } from '@modules/admin-auth'
import { Module } from '@nestjs/common'
import { AdminStaffController } from './admin-staff.controller'
import { AdminStaffService } from './admin-staff.service'

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [AdminStaffController],
  providers: [AdminStaffService],
})
export class AdminStaffModule {}
