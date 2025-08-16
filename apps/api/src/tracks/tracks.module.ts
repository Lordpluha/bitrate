import { Module } from '@nestjs/common'
import { TracksService } from './tracks.service'
import { TracksController } from './tracks.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { JwtModule } from '@nestjs/jwt'
import { AuthModule } from 'src/auth/auth.module'
import { AudioGateway } from './audio.gateway'

@Module({
  providers: [TracksService, AudioGateway],
  controllers: [TracksController],
  imports: [PrismaModule, AuthModule, JwtModule],
  exports: [TracksService, AudioGateway]
})
export class TracksModule {}
