import { PrismaModule } from '@infra/prisma/prisma.module'
import { AuthModule } from '@modules/auth/auth.module'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AudioGateway } from './audio.gateway'
import { TracksController } from './tracks.controller'
import { TracksService } from './tracks.service'

@Module({
  providers: [TracksService, AudioGateway],
  controllers: [TracksController],
  imports: [PrismaModule, AuthModule, JwtModule],
  exports: [TracksService, AudioGateway],
})
export class TracksModule {}
