import { SESSION_ROUTE_THROTTLE } from '@common/config'
import type { ArtistEntity } from '@modules/artists/entities'
import { readAccessToken } from '@modules/auth-core'
import { TokenService } from '@modules/tokens/token.service'
import {
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
} from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import type { Request, Response } from 'express'
import { ArtistAccountsService } from './artist-accounts.service'
import { ArtistAuth } from './artists-auth.guard'
import { CurrentArtist } from './decorators'
import { ArtistSavedAccountsEntity } from './entities/artist-saved-account.entity'
import { sessionClient } from './session-client'

@ApiTags('Artists Auth')
@ArtistAuth()
@Throttle(SESSION_ROUTE_THROTTLE)
@Controller({ path: 'artists/auth/accounts', version: '1' })
export class ArtistAccountsController {
  constructor(
    private readonly accounts: ArtistAccountsService,
    private readonly token: TokenService,
  ) {}
  private credential(request: Request): string | undefined {
    return this.token.readArtistAccountsCookie(request)
  }

  @Get()
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({ summary: 'List accounts previously authenticated in this browser' })
  @ApiResponse({ status: 200, type: ArtistSavedAccountsEntity })
  list(@CurrentArtist() artist: ArtistEntity, @Req() request: Request) {
    return this.accounts.list(artist.id, this.credential(request))
  }

  @Post('current')
  @HttpCode(200)
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({ summary: 'Remember the authenticated account before adding another' })
  @ApiResponse({ status: 200, type: ArtistSavedAccountsEntity })
  async remember(
    @CurrentArtist() artist: ArtistEntity,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const raw = await this.accounts.remember(
      artist.id,
      readAccessToken(request, 'artist'),
      this.credential(request),
    )
    this.token.setArtistAccountsCookie(response, raw)
    return this.accounts.list(artist.id, raw)
  }

  @Post(':artistId/switch')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Switch to an already authenticated account without exposing session tokens',
  })
  @ApiParam({ name: 'artistId', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Active session replaced; reload the workspace' })
  async switchAccount(
    @CurrentArtist() artist: ArtistEntity,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Param('artistId', ParseUUIDPipe) artistId: string,
  ) {
    const raw = this.credential(request)
    const result = await this.accounts.switchAccount(
      artist.id,
      readAccessToken(request, 'artist'),
      raw,
      artistId,
      sessionClient(request),
    )
    if (result) this.token.setAuthCookies(response, 'artist', result.access, result.refresh)
    if (raw) this.token.setArtistAccountsCookie(response, raw)
  }

  @Delete(':artistId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a saved account and revoke its session in this browser' })
  @ApiParam({ name: 'artistId', format: 'uuid' })
  @ApiResponse({ status: 204 })
  remove(
    @CurrentArtist() artist: ArtistEntity,
    @Req() request: Request,
    @Param('artistId', ParseUUIDPipe) artistId: string,
  ) {
    return this.accounts.remove(artist.id, this.credential(request), artistId)
  }
}
