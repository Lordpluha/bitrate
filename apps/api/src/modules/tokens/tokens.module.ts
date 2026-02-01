import { AppConfig } from '@common/config'
import { PrismaModule } from '@infra/prisma/prisma.module'
import { TokenService } from '@modules/tokens/token.service'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'

@Module({
  providers: [TokenService],
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig>) => ({
        secret: config.getOrThrow('JWT_SECRET'),
        signOptions: { expiresIn: '60s' },
        global: true,
      }),
    }),
  ],
  exports: [JwtModule, TokenService],
})
export class TokensModule {}
