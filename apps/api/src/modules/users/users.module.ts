import { PrismaModule } from '@infra/prisma/prisma.module'
import { TokensModule } from '@modules/tokens/tokens.module'
import { UsersPrivateService } from '@modules/users/users.private.service'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { forwardRef, Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  providers: [UsersService, UsersPrivateService],
  controllers: [UsersController],
  exports: [UsersService, UsersPrivateService],
  imports: [PrismaModule, TokensModule, forwardRef(() => UsersAuthModule)],
})
export class UsersModule {}
