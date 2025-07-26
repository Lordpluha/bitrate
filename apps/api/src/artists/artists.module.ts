import { Module } from '@nestjs/common'
import { ArtistsController } from './artists.controller'
import { ArtistsService } from './artists.service'

@Module({
  controllers: [ArtistsController],
  providers: [ArtistsService]
})
export class ArtistsModule {}
