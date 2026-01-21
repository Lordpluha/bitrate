import { PrismaModule } from '@infra/prisma/prisma.module'
import { AuthModule } from '@modules/auth/auth.module'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ArtistsController } from './artists.controller'
import { ArtistsService } from './artists.service'

@Module({
  controllers: [ArtistsController],
  providers: [ArtistsService],
  imports: [PrismaModule, JwtModule, AuthModule],
  exports: [ArtistsService],
})
export class ArtistsModule {}
