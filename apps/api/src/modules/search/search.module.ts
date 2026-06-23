import { CacheModule } from '@infra/cache/cache.module'
import { PrismaModule } from '@infra/prisma/prisma.module'
import { Module } from '@nestjs/common'
import { SearchController } from './search.controller'
import { SearchService } from './search.service'

@Module({
  imports: [PrismaModule, CacheModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
