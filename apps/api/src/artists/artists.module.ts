import { Module } from '@nestjs/common'
import { ArtistsController } from './artists.controller'
import { ArtistsService } from './artists.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { JwtModule } from '@nestjs/jwt'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  controllers: [ArtistsController],
  providers: [ArtistsService],
  imports: [PrismaModule, JwtModule, AuthModule],
  exports: [ArtistsService]
})
export class ArtistsModule {}
