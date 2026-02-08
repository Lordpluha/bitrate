import { PrismaModule } from '@infra/prisma/prisma.module'
import { ArtistsModule } from '@modules/artists/artists.module'
import { TokensModule } from '@modules/tokens/tokens.module'
import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { AuthController } from './artists-auth.controller'
import { ArtistsAuthService } from './artists-auth.service'

@Module({
  imports: [PrismaModule, ArtistsModule, UsersModule, TokensModule],
  providers: [ArtistsAuthService],
  controllers: [AuthController],
  exports: [ArtistsAuthService, TokensModule],
})
export class ArtistsAuthModule {}
