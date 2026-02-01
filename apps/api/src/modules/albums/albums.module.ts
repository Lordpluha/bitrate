import { PrismaModule } from '@infra/prisma/prisma.module'
import { TokensModule } from '@modules/tokens/tokens.module'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { Module } from '@nestjs/common'
import { AlbumsController } from './albums.controller'
import { AlbumsService } from './albums.service'

@Module({
  controllers: [AlbumsController],
  providers: [AlbumsService],
  imports: [PrismaModule, UsersAuthModule, TokensModule],
  exports: [AlbumsService],
})
export class AlbumsModule {}
