import { forwardRef, Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { JwtModule } from '@nestjs/jwt'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
  imports: [PrismaModule, JwtModule, forwardRef(() => AuthModule)]
})
export class UsersModule {}
