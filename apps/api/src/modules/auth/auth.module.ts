import { PrismaModule } from '@infra/prisma/prisma.module'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { UsersModule } from '../users/users.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { TokenService } from './token.service'

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60s' },
        global: true,
      }),
    }),
  ],
  providers: [AuthService, TokenService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, TokenService],
})
export class AuthModule {}
