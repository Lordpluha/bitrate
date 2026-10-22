import { PrismaModule } from '@infra/prisma/prisma.module'
import { AdminAuthModule } from '@modules/admin-auth'
import { Module } from '@nestjs/common'
import { AdminStaffController } from './admin-staff.controller'
import { AdminStaffService } from './admin-staff.service'
import { AdminStaffPermissionsService } from './admin-staff-permissions.service'

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [AdminStaffController],
  providers: [AdminStaffService, AdminStaffPermissionsService],
})
export class AdminStaffModule {}
