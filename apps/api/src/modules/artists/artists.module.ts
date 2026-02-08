import { PrismaModule } from '@infra/prisma/prisma.module'
import { ArtistsPrivateService } from '@modules/artists/artists.private.service'
import { TokensModule } from '@modules/tokens/tokens.module'
import { Module } from '@nestjs/common'
import { ArtistsController } from './artists.controller'
import { ArtistsService } from './artists.service'

@Module({
  controllers: [ArtistsController],
  providers: [ArtistsService, ArtistsPrivateService],
  imports: [PrismaModule, TokensModule],
  exports: [ArtistsService, ArtistsPrivateService],
})
export class ArtistsModule {}
