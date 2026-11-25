import { AdminAuthModule } from '@modules/admin-auth'
import { SupportInboxModule } from '@modules/support'
import { Module } from '@nestjs/common'
import { AdminSupportController } from './admin-support.controller'

@Module({
  imports: [SupportInboxModule, AdminAuthModule],
  controllers: [AdminSupportController],
})
export class AdminSupportModule {}
