import { CacheModule } from '@infra/cache/cache.module'
import { MailModule } from '@infra/mail/mail.module'
import { PrismaModule } from '@infra/prisma/prisma.module'
import { ArtistsModule } from '@modules/artists/artists.module'
import { TokensModule } from '@modules/tokens/tokens.module'
import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { ArtistEmailCodeService } from './artist-email-code.service'
import { ArtistOAuthService } from './artist-oauth.service'
import { ArtistTwoFactorService } from './artist-two-factor.service'
import { AuthController } from './artists-auth.controller'
import { ArtistsAuthService } from './artists-auth.service'
import { ArtistsOAuthController } from './artists-oauth.controller'

@Module({
  imports: [PrismaModule, ArtistsModule, UsersModule, TokensModule, MailModule, CacheModule],
  providers: [
    ArtistsAuthService,
    ArtistTwoFactorService,
    ArtistOAuthService,
    ArtistEmailCodeService,
  ],
  controllers: [AuthController, ArtistsOAuthController],
  exports: [ArtistsAuthService, TokensModule],
})
export class ArtistsAuthModule {}
