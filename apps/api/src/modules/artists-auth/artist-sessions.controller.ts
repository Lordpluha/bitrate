import { SESSION_ROUTE_THROTTLE } from '@common/config'
import { TokenService } from '@modules/tokens/token.service'
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
  ListArtistSessionsSwagger,
  RevokeArtistSessionSwagger,
  RevokeOtherArtistSessionsSwagger,
} from './decorators'
import type { ArtistAuthRequest } from './types'

/** The artist's signed-in devices, from account settings. */
@ApiTags('Artists Auth')
@ArtistAuth()
@Throttle(SESSION_ROUTE_THROTTLE)
@Controller({ path: 'artists/auth/sessions', version: '1' })
export class ArtistSessionsController {
  constructor(
    private readonly sessions: ArtistSessionsService,
    private readonly tokens: TokenService,
  ) {}

  @ListArtistSessionsSwagger()
  @Header('Cache-Control', 'private, no-store')
  @Get()
  list(@Req() request: ArtistAuthRequest & Request) {
    return this.sessions.list(request.artist.id, this.accessToken(request))
  }

  @RevokeOtherArtistSessionsSwagger()
  @HttpCode(HttpStatus.OK)
  @Post('revoke-others')
  revokeOthers(@Req() request: ArtistAuthRequest & Request) {
    return this.sessions.revokeOthers(request.artist.id, this.accessToken(request))
  }

  @RevokeArtistSessionSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  revoke(@Req() request: ArtistAuthRequest & Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.sessions.revoke(request.artist.id, id, this.accessToken(request))
  }

  /** The guard stores the verified access token on the request under its cookie name. */
  private accessToken(request: Request): string {
    const token: unknown = Reflect.get(request, this.tokens.getTokenName('access'))
    return typeof token === 'string' ? token : ''
  }
}
