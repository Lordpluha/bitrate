import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PrismaModule } from 'src/prisma/prisma.module'
import { AlbumsController } from './albums.controller'
import { AlbumsService } from './albums.service'

@Module({
  controllers: [AlbumsController],
  providers: [AlbumsService],
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
  exports: [AlbumsService]
})
export class AlbumsModule {}
