import { TokensModule } from '@modules/tokens/tokens.module'
import { UsersAuthModule } from '@modules/users-auth/users-auth.module'
import { Module } from '@nestjs/common'
import { StaticAssetsController } from './static-assets.controller'
import { StorageController } from './storage.controller'
import { StorageCoreModule } from './storage-core.module'

/** HTTP-facing storage: the signed-URL controller on top of the auth-free StorageCoreModule. */
@Module({
  imports: [StorageCoreModule, UsersAuthModule, TokensModule],
  controllers: [StorageController, StaticAssetsController],
  exports: [StorageCoreModule],
})
export class StorageModule {}
