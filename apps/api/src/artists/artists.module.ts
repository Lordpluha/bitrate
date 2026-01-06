import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthModule } from 'src/auth/auth.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import { ArtistsController } from './artists.controller'
import { ArtistsService } from './artists.service'

@Module({
  controllers: [ArtistsController],
  providers: [ArtistsService],
  imports: [PrismaModule, JwtModule, AuthModule],
  exports: [ArtistsService],
})
export class ArtistsModule {}
