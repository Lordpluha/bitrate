import { Module } from '@nestjs/common'
import { TracksService } from './tracks.service'
import { TracksController } from './tracks.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { JwtModule } from '@nestjs/jwt'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  providers: [TracksService],
  controllers: [TracksController],
  imports: [PrismaModule, JwtModule, AuthModule],
  exports: [TracksService]
})
export class TracksModule {}
