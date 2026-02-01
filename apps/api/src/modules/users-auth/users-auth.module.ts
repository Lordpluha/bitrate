import { PrismaModule } from '@infra/prisma/prisma.module'
import { TokensModule } from '@modules/tokens/tokens.module'
import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { UserAuthService } from './user-auth.service'
import { UsersAuthController } from './users-auth.controller'

@Module({
  imports: [PrismaModule, UsersModule, TokensModule],
  controllers: [UsersAuthController],
  providers: [UserAuthService],
  exports: [UserAuthService],
})
export class UsersAuthModule {}
