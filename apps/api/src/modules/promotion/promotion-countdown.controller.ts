import { Controller, Get, Header, Param, ParseUUIDPipe } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ArtistCountdownService } from './countdown/artist-countdown.service'
import { GetArtistCountdownSwagger } from './decorators'

/** Public: the countdown tile listeners see on an artist page (spec AC-11). */
@ApiTags('Artists')
@Controller({ path: 'artists', version: '1' })
export class PromotionCountdownController {
  constructor(private readonly countdowns: ArtistCountdownService) {}

  @GetArtistCountdownSwagger()
  @Header('Cache-Control', 'public, max-age=60')
  @Get(':id/countdown')
  countdown(@Param('id', ParseUUIDPipe) id: string) {
    return this.countdowns.countdown(id)
  }
}
