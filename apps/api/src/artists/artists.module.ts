import { Module } from '@nestjs/common'
import { ArtistsController } from './artists.controller'
import { ArtistsService } from './artists.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { JwtModule } from '@nestjs/jwt'

@Module({
  controllers: [ArtistsController],
  providers: [ArtistsService],
  imports: [PrismaModule, JwtModule],
  exports: [ArtistsService]
})
export class ArtistsModule {}
