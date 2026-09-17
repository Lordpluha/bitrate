import { PrismaModule } from '@infra/prisma/prisma.module'
import { AdminAuthModule } from '@modules/admin-auth'
import { Module } from '@nestjs/common'
import { AdminRolesController } from './admin-roles.controller'
import { AdminRolesService } from './admin-roles.service'

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [AdminRolesController],
  providers: [AdminRolesService],
})
export class AdminRolesModule {}
