import type { ArtistEntity } from '@modules/artists/entities'
import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import { CurrentArtist } from '@modules/artists-auth/decorators/current-artist.decorator'
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import {
  AddReleaseContributorSwagger,
  CreateReleaseSwagger,
  CreditReleaseArtistSwagger,
  DeleteReleaseSwagger,
  ListReleasesSwagger,
  ReleaseContributorSwagger,
  ReleaseDetailSwagger,
  ReleaseWorkspaceSwagger,
  RemoveReleaseContributorSwagger,
  ReplaceReleaseSplitsSwagger,
  ReviseReleaseSwagger,
  SubmitReleaseSwagger,
  UpdateReleaseContributorSwagger,
  UpdateReleaseRightsSwagger,
  UpdateReleaseSwagger,
  UpdateReleaseTrackSwagger,
  WithdrawReleaseSwagger,
} from './decorators'
import {
  type AddReleaseContributorDto,
  AddReleaseContributorSchema,
} from './dtos/add-release-contributor.dto'
import { type CreateReleaseDto, CreateReleaseSchema } from './dtos/create-release.dto'
import { type ListReleasesDto, ListReleasesSchema } from './dtos/list-releases.dto'
import { type ReleaseDraftVersionDto, ReleaseDraftVersionSchema } from './dtos/release-media.dto'
import {
  type ReplaceReleaseSplitsDto,
  ReplaceReleaseSplitsSchema,
} from './dtos/replace-release-splits.dto'
import {
  type ReviseReleaseDto,
  ReviseReleaseSchema,
  type SubmitReleaseDto,
  SubmitReleaseSchema,
  type WithdrawReleaseDto,
  WithdrawReleaseSchema,
} from './dtos/submit-release.dto'
import { type UpdateReleaseDto, UpdateReleaseSchema } from './dtos/update-release.dto'
import {
  type UpdateReleaseContributorDto,
  UpdateReleaseContributorSchema,
} from './dtos/update-release-contributor.dto'
import {
  type UpdateReleaseRightsDto,
  UpdateReleaseRightsSchema,
} from './dtos/update-release-rights.dto'
import {
  type UpdateReleaseTrackDto,
  UpdateReleaseTrackSchema,
} from './dtos/update-release-track.dto'
import { ReleaseEntity } from './entities/release.entity'
import { ReleaseBlockerEntity } from './entities/release-workspace.entity'
import { ReleaseCreditsService } from './release-credits.service'
import { ReleaseDeletionService } from './release-deletion.service'
import { ReleasesService } from './releases.service'

@ApiTags('Releases')
@ApiExtraModels(ReleaseEntity, ReleaseBlockerEntity)
@Controller({ path: 'artists/me/releases', version: '1' })
export class ReleasesController {
  constructor(
    private readonly releases: ReleasesService,
    private readonly credits: ReleaseCreditsService,
    private readonly deletion: ReleaseDeletionService,
  ) {}

  @CreateReleaseSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Post()
  createDraft(
    @CurrentArtist() artist: ArtistEntity,
    @Body(new ZodValidationPipe(CreateReleaseSchema)) input: CreateReleaseDto,
  ) {
    return this.releases.createDraft(artist, input)
  }

  @ListReleasesSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get()
  findAll(
    @CurrentArtist() artist: ArtistEntity,
    @Query(new ZodValidationPipe(ListReleasesSchema)) query: ListReleasesDto,
  ) {
    return this.releases.findAll(artist.id, query)
  }

  @ReleaseDetailSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get(':id')
  findOne(@CurrentArtist() artist: ArtistEntity, @Param('id', ParseUUIDPipe) id: string) {
    return this.releases.findOne(artist.id, id)
  }

  @ReleaseWorkspaceSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get(':id/workspace')
  workspace(@CurrentArtist() artist: ArtistEntity, @Param('id', ParseUUIDPipe) id: string) {
    return this.releases.workspace(artist.id, id)
  }

  @UpdateReleaseSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Patch(':id')
  updateDraft(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateReleaseSchema)) input: UpdateReleaseDto,
  ) {
    return this.releases.updateDraft(artist.id, id, input)
  }

  @DeleteReleaseSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(204)
  @Delete(':id')
  async deleteDraft(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ReleaseDraftVersionSchema)) input: ReleaseDraftVersionDto,
  ): Promise<void> {
    await this.deletion.remove(artist.id, id, input)
  }

  @AddReleaseContributorSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Post(':id/contributors')
  addContributor(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(AddReleaseContributorSchema)) input: AddReleaseContributorDto,
  ) {
    return this.credits.addContributor(artist.id, id, input)
  }

  @CreditReleaseArtistSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Post(':id/contributors/self')
  creditSelf(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ReleaseDraftVersionSchema)) input: ReleaseDraftVersionDto,
  ) {
    return this.credits.creditSelf(artist, id, input)
  }

  @RemoveReleaseContributorSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  @Delete(':id/contributors/:contributorId')
  removeContributor(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contributorId', ParseUUIDPipe) contributorId: string,
    @Body(new ZodValidationPipe(ReleaseDraftVersionSchema)) input: ReleaseDraftVersionDto,
  ) {
    return this.credits.removeContributor(artist.id, id, contributorId, input)
  }

  @ReleaseContributorSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get(':id/contributors/:contributorId')
  contributor(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contributorId', ParseUUIDPipe) contributorId: string,
  ) {
    return this.credits.contributor(artist.id, id, contributorId)
  }

  @UpdateReleaseContributorSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Patch(':id/contributors/:contributorId')
  updateContributor(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contributorId', ParseUUIDPipe) contributorId: string,
    @Body(new ZodValidationPipe(UpdateReleaseContributorSchema)) input: UpdateReleaseContributorDto,
  ) {
    return this.credits.updateContributor(artist.id, id, contributorId, input)
  }

  @UpdateReleaseRightsSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Patch(':id/rights')
  updateRights(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateReleaseRightsSchema)) input: UpdateReleaseRightsDto,
  ) {
    return this.credits.updateRights(artist.id, id, input)
  }

  @ReplaceReleaseSplitsSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Put(':id/splits')
  replaceSplits(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ReplaceReleaseSplitsSchema)) input: ReplaceReleaseSplitsDto,
  ) {
    return this.credits.replaceSplits(artist.id, id, input)
  }

  @UpdateReleaseTrackSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Patch(':id/tracks/:trackId')
  updateTrack(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('trackId', ParseUUIDPipe) trackId: string,
    @Body(new ZodValidationPipe(UpdateReleaseTrackSchema)) input: UpdateReleaseTrackDto,
  ) {
    return this.releases.updateTrack(artist.id, id, trackId, input)
  }

  @SubmitReleaseSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  @Post(':id/submit')
  submit(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(SubmitReleaseSchema)) input: SubmitReleaseDto,
  ) {
    return this.releases.submit(artist.id, id, input)
  }

  @WithdrawReleaseSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  @Post(':id/withdraw')
  withdraw(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(WithdrawReleaseSchema)) input: WithdrawReleaseDto,
  ) {
    return this.releases.withdraw(artist.id, id, input)
  }

  @ReviseReleaseSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  @Post(':id/revise')
  revise(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ReviseReleaseSchema)) input: ReviseReleaseDto,
  ) {
    return this.releases.revise(artist.id, id, input)
  }
}
