import { CacheModule } from '@infra/cache/cache.module'
import { PrismaModule } from '@infra/prisma/prisma.module'
import { Module } from '@nestjs/common'
import { AlbumsService } from './albums.service'

/** `AlbumsService` without the controller or auth, for processes that only need the service (#458). */
@Module({
  imports: [PrismaModule, CacheModule],
  providers: [AlbumsService],
  exports: [AlbumsService],
})
export class AlbumsCoreModule {}
