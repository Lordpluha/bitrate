import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'
import { AlbumsController } from './albums.controller'
import { AlbumsService } from './albums.service'
import { JwtModule } from '@nestjs/jwt'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  controllers: [AlbumsController],
  providers: [AlbumsService],
  imports: [PrismaModule, JwtModule, AuthModule],
  exports: [AlbumsService]
})
export class AlbumsModule {}
