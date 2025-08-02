import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { UsersModule } from '../users/users.module'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth.controller'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PrismaModule } from 'src/prisma/prisma.module'
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
        global: true
      })
    })
  ],
  providers: [AuthService, TokenService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, TokenService]
})
export class AuthModule {}
