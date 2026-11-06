import type { ArtistEntity } from '@modules/artists/entities'
import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import { CurrentArtist } from '@modules/artists-auth/decorators/current-artist.decorator'
import { Controller, Get, Header } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ArtistDashboardService } from './artist-dashboard.service'
import { ArtistDashboardSwagger } from './decorators'

@ApiTags('Releases')
@Controller({ path: 'artists/me/dashboard', version: '1' })
export class ArtistDashboardController {
  constructor(private readonly dashboard: ArtistDashboardService) {}

  @ArtistDashboardSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get()
  summary(@CurrentArtist() artist: ArtistEntity) {
    return this.dashboard.summary(artist.id)
  }
}
