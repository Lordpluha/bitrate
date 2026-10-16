import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import type { ArtistAuthRequest } from '@modules/artists-auth/types'
import { Controller, Get, Header, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ArtistDashboardService } from './artist-dashboard.service'
import { ArtistDashboardSwagger } from './decorators'

@ApiTags('Releases')
@Controller({ path: 'artist-dashboard', version: '1' })
export class ArtistDashboardController {
  constructor(private readonly dashboard: ArtistDashboardService) {}

  @ArtistDashboardSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get()
  summary(@Req() request: ArtistAuthRequest) {
    return this.dashboard.summary(request.artist.id)
  }
}
