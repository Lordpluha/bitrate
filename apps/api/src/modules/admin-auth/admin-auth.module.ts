import { PrismaModule } from '@infra/prisma/prisma.module'
// biome-ignore lint/style/useImportType: constructor-injected — NestJS DI needs the real class reference at runtime, not a type-only import.
import { PrismaService } from '@infra/prisma/prisma.service'
import { ensureBuiltInRoles } from '@infra/seeds/built-in-roles'
import { TokensModule } from '@modules/tokens/tokens.module'
import { Module, type OnModuleInit } from '@nestjs/common'
import { AdminAuthController } from './admin-auth.controller'
import { AdminAuthGuard } from './admin-auth.guard'
import { AdminAuthService } from './admin-auth.service'

@Module({
  imports: [PrismaModule, TokensModule],
  providers: [AdminAuthService, AdminAuthGuard],
  controllers: [AdminAuthController],
  exports: [AdminAuthService, AdminAuthGuard, TokensModule],
})
export class AdminAuthModule implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  /** Ensures the built-in ADMIN and MODERATOR roles exist, so a restored dump never lacks them. */
  async onModuleInit(): Promise<void> {
    await ensureBuiltInRoles(this.prisma)
  }
}
