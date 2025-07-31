import { Module } from '@nestjs/common'
import { ArtistsController } from './artists.controller'
import { ArtistsService } from './artists.service'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PrismaModule } from 'src/prisma/prisma.module'

@Module({
  controllers: [ArtistsController],
  providers: [ArtistsService],
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60s' }
      })
    })
  ],
  exports: [ArtistsService]
})
export class ArtistsModule {}
