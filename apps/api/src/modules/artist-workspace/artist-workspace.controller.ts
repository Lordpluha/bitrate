import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import type { ArtistAuthRequest } from '@modules/artists-auth/types'
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseEnumPipe,
  Put,
  Req,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { ArtistWorkspaceService } from './artist-workspace.service'
import {
  GetWorkspaceLayoutSwagger,
  ResetWorkspaceLayoutSwagger,
  SaveWorkspaceLayoutSwagger,
} from './decorators'
import {
  type SaveWorkspaceLayoutDto,
  SaveWorkspaceLayoutSchema,
  WORKSPACE_LAYOUT_PAGES,
  type WorkspaceLayoutPage,
} from './dtos/workspace-layout.dto'

/** The signed-in artist's own workspace preferences. */
@ApiTags('Artist workspace')
@Controller({ path: 'artist-workspace', version: '1' })
export class ArtistWorkspaceController {
  constructor(private readonly workspace: ArtistWorkspaceService) {}

  @GetWorkspaceLayoutSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get('layouts/:page')
  layout(
    @Req() request: ArtistAuthRequest,
    @Param('page', new ParseEnumPipe(WORKSPACE_LAYOUT_PAGES)) page: WorkspaceLayoutPage,
  ) {
    return this.workspace.layout(request.artist.id, page)
  }

  @SaveWorkspaceLayoutSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Put('layouts/:page')
  saveLayout(
    @Req() request: ArtistAuthRequest,
    @Param('page', new ParseEnumPipe(WORKSPACE_LAYOUT_PAGES)) page: WorkspaceLayoutPage,
    @Body(new ZodValidationPipe(SaveWorkspaceLayoutSchema)) input: SaveWorkspaceLayoutDto,
  ) {
    return this.workspace.saveLayout(request.artist.id, page, input)
  }

  @ResetWorkspaceLayoutSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Delete('layouts/:page')
  resetLayout(
    @Req() request: ArtistAuthRequest,
    @Param('page', new ParseEnumPipe(WORKSPACE_LAYOUT_PAGES)) page: WorkspaceLayoutPage,
  ) {
    return this.workspace.resetLayout(request.artist.id, page)
  }
}
