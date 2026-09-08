import { PrismaModule } from '@infra/prisma/prisma.module'
import { TokensModule } from '@modules/tokens/tokens.module'
import { Module } from '@nestjs/common'
import { AdminAuthController } from './admin-auth.controller'
import { AdminAuthGuard } from './admin-auth.guard'
import { AdminAuthService } from './admin-auth.service'

@Module({
  imports: [PrismaModule, TokensModule],
  providers: [AdminAuthService, AdminAuthGuard],
  controllers: [AdminAuthController],
  exports: [AdminAuthService, AdminAuthGuard, TokensModule],
})
export class AdminAuthModule {}
