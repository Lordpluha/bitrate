import { CacheModule } from '@infra/cache/cache.module'
import { PrismaModule } from '@infra/prisma/prisma.module'
import { TokensModule } from '@modules/tokens/tokens.module'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { Module } from '@nestjs/common'
import { SearchController } from './search.controller'
import { SearchService } from './search.service'

@Module({
  imports: [PrismaModule, CacheModule, UsersAuthModule, TokensModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
