import { TokensModule } from '@modules/tokens/tokens.module'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { Module } from '@nestjs/common'
import { AlbumsController } from './albums.controller'
import { AlbumsCoreModule } from './albums-core.module'

@Module({
  controllers: [AlbumsController],
  imports: [AlbumsCoreModule, UsersAuthModule, TokensModule],
  exports: [AlbumsCoreModule],
})
export class AlbumsModule {}
