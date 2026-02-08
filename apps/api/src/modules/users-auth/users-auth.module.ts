import { PrismaModule } from '@infra/prisma/prisma.module'
import { TokensModule } from '@modules/tokens/tokens.module'
import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { UserAuthService } from './user-auth.service'
import { UsersAuthController } from './users-auth.controller'
import { WsUserAuthGuard } from './users-auth.ws.guard'

@Module({
  imports: [PrismaModule, UsersModule, TokensModule],
  controllers: [UsersAuthController],
  providers: [UserAuthService, WsUserAuthGuard],
  exports: [UserAuthService, WsUserAuthGuard],
})
export class UsersAuthModule {}
