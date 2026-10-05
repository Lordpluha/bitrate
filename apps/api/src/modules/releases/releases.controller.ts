import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import type { ArtistAuthRequest } from '@modules/artists-auth/types'
import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import {
  AddReleaseContributorSwagger,
  CreateReleaseSwagger,
  ListReleasesSwagger,
  ReleaseContributorSwagger,
  ReleaseDetailSwagger,
  ReleaseWorkspaceSwagger,
  UpdateReleaseContributorSwagger,
  UpdateReleaseSwagger,
} from './decorators'
import {
  type AddReleaseContributorDto,
  AddReleaseContributorSchema,
} from './dtos/add-release-contributor.dto'
import { type CreateReleaseDto, CreateReleaseSchema } from './dtos/create-release.dto'
import { type ListReleasesDto, ListReleasesSchema } from './dtos/list-releases.dto'
import { type UpdateReleaseDto, UpdateReleaseSchema } from './dtos/update-release.dto'
import {
  type UpdateReleaseContributorDto,
  UpdateReleaseContributorSchema,
} from './dtos/update-release-contributor.dto'
import { ReleaseEntity } from './entities/release.entity'
import { ReleasesService } from './releases.service'

@ApiTags('Releases')
@ApiExtraModels(ReleaseEntity)
@Controller({ path: 'releases', version: '1' })
export class ReleasesController {
  constructor(private readonly releases: ReleasesService) {}

  @CreateReleaseSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Post()
  createDraft(
    @Req() request: ArtistAuthRequest,
    @Body(new ZodValidationPipe(CreateReleaseSchema)) input: CreateReleaseDto,
  ) {
    return this.releases.createDraft(request.artist.id, input)
  }

  @ListReleasesSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get()
  findAll(
    @Req() request: ArtistAuthRequest,
    @Query(new ZodValidationPipe(ListReleasesSchema)) query: ListReleasesDto,
  ) {
    return this.releases.findAll(request.artist.id, query)
  }

  @ReleaseDetailSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get(':id')
  findOne(@Req() request: ArtistAuthRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.releases.findOne(request.artist.id, id)
  }

  @ReleaseWorkspaceSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get(':id/workspace')
  workspace(@Req() request: ArtistAuthRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.releases.workspace(request.artist.id, id)
  }

  @UpdateReleaseSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Patch(':id')
  updateDraft(
    @Req() request: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateReleaseSchema)) input: UpdateReleaseDto,
  ) {
    return this.releases.updateDraft(request.artist.id, id, input)
  }

  @AddReleaseContributorSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Post(':id/contributors')
  addContributor(
    @Req() request: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(AddReleaseContributorSchema)) input: AddReleaseContributorDto,
  ) {
    return this.releases.addContributor(request.artist.id, id, input)
  }

  @ReleaseContributorSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get(':id/contributors/:contributorId')
  contributor(
    @Req() request: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contributorId', ParseUUIDPipe) contributorId: string,
  ) {
    return this.releases.contributor(request.artist.id, id, contributorId)
  }

  @UpdateReleaseContributorSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Patch(':id/contributors/:contributorId')
  updateContributor(
    @Req() request: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contributorId', ParseUUIDPipe) contributorId: string,
    @Body(new ZodValidationPipe(UpdateReleaseContributorSchema)) input: UpdateReleaseContributorDto,
  ) {
    return this.releases.updateContributor(request.artist.id, id, contributorId, input)
  }
}
