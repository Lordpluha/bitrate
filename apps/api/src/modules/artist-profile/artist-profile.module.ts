import { CacheModule } from '@infra/cache/cache.module'
import { PrismaModule } from '@infra/prisma/prisma.module'
import { StorageCoreModule } from '@infra/storage/storage-core.module'
import { TokensModule } from '@modules/tokens/tokens.module'
import { Module } from '@nestjs/common'
import { ArtistProfileController } from './artist-profile.controller'
import { ArtistProfileService } from './artist-profile.service'

@Module({
  imports: [PrismaModule, CacheModule, StorageCoreModule, TokensModule],
  controllers: [ArtistProfileController],
  providers: [ArtistProfileService],
})
export class ArtistProfileModule {}
