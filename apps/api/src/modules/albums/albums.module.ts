import { PrismaModule } from '@infra/prisma/prisma.module'
import { AuthModule } from '@modules/auth/auth.module'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AlbumsController } from './albums.controller'
import { AlbumsService } from './albums.service'

@Module({
  controllers: [AlbumsController],
  providers: [AlbumsService],
  imports: [PrismaModule, JwtModule, AuthModule],
  exports: [AlbumsService],
})
export class AlbumsModule {}
