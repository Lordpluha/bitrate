import { SESSION_ROUTE_THROTTLE } from '@common/config'
import type { ArtistEntity } from '@modules/artists/entities'
import { readAccessToken } from '@modules/auth-core'
import {
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import type { Request } from 'express'
import { ArtistSessionsService } from './artist-sessions.service'
import { ArtistAuth } from './artists-auth.guard'
import {
  CurrentArtist,
  ListArtistSessionsSwagger,
  RevokeArtistSessionSwagger,
  RevokeOtherArtistSessionsSwagger,
} from './decorators'

/** The artist's signed-in devices, from account settings. */
@ApiTags('Artists Auth')
@ArtistAuth()
@Throttle(SESSION_ROUTE_THROTTLE)
@Controller({ path: 'artists/auth/sessions', version: '1' })
export class ArtistSessionsController {
  constructor(private readonly sessions: ArtistSessionsService) {}

  @ListArtistSessionsSwagger()
  @Header('Cache-Control', 'private, no-store')
  @Get()
  list(@CurrentArtist() artist: ArtistEntity, @Req() request: Request) {
    return this.sessions.list(artist.id, readAccessToken(request, 'artist'))
  }

  @RevokeOtherArtistSessionsSwagger()
  @HttpCode(HttpStatus.OK)
  @Post('revoke-others')
  revokeOthers(@CurrentArtist() artist: ArtistEntity, @Req() request: Request) {
    return this.sessions.revokeOthers(artist.id, readAccessToken(request, 'artist'))
  }

  @RevokeArtistSessionSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  revoke(
    @CurrentArtist() artist: ArtistEntity,
    @Req() request: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.sessions.revoke(artist.id, id, readAccessToken(request, 'artist'))
  }
}
