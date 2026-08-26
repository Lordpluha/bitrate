import { MailModule } from '@infra/mail/mail.module'
import { PrismaModule } from '@infra/prisma/prisma.module'
import { TokensModule } from '@modules/tokens/tokens.module'
import { forwardRef, Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { OAuthService } from './oauth.service'
import { TwoFactorService } from './two-factor.service'
import { UserAuthService } from './user-auth.service'
import { UsersAuthController } from './users-auth.controller'
import { OptionalUserAuthGuard, UserAuthGuard } from './users-auth.guard'
import { WsUserAuthGuard } from './users-auth.ws.guard'
import { UsersOAuthController } from './users-oauth.controller'

@Module({
  imports: [PrismaModule, forwardRef(() => UsersModule), TokensModule, MailModule],
  controllers: [UsersAuthController, UsersOAuthController],
  providers: [
    UserAuthService,
    OAuthService,
    TwoFactorService,
    UserAuthGuard,
    OptionalUserAuthGuard,
    WsUserAuthGuard,
  ],
  exports: [TokensModule, UserAuthService, UserAuthGuard, OptionalUserAuthGuard, WsUserAuthGuard],
})
export class UsersAuthModule {}
