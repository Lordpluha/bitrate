import { PrismaModule } from '@infra/prisma/prisma.module'
import { TokensModule } from '@modules/tokens/tokens.module'
import { Module } from '@nestjs/common'
import { ArtistWorkspaceController } from './artist-workspace.controller'
import { ArtistWorkspaceService } from './artist-workspace.service'

@Module({
  imports: [PrismaModule, TokensModule],
  controllers: [ArtistWorkspaceController],
  providers: [ArtistWorkspaceService],
})
export class ArtistWorkspaceModule {}
