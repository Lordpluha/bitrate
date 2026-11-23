import type { ArtistEntity } from '@modules/artists/entities'
import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import { CurrentArtist } from '@modules/artists-auth/decorators/current-artist.decorator'
import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import {
  ListReleaseChangesSwagger,
  SubmitReleaseChangesSwagger,
  WithdrawReleaseChangesSwagger,
} from './decorators'
import {
  type SubmitReleaseChangesDto,
  SubmitReleaseChangesSchema,
} from './dtos/release-changes.dto'
import { ReleaseChangesService } from './release-changes.service'
import { ReleaseCoverInterceptor } from './release-media.interceptors'

/** Changes an artist proposes to a published release; staff review each one. */
@ApiTags('Releases')
@Controller({ path: 'artists/me/releases', version: '1' })
export class ReleaseChangesController {
  constructor(private readonly changes: ReleaseChangesService) {}

  @ListReleaseChangesSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get(':id/changes')
  list(@CurrentArtist() artist: ArtistEntity, @Param('id', ParseUUIDPipe) id: string) {
    return this.changes.list(artist.id, id)
  }

  @SubmitReleaseChangesSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @ReleaseCoverInterceptor()
  @Post(':id/changes')
  submit(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() cover: Express.Multer.File | undefined,
    @Body(new ZodValidationPipe(SubmitReleaseChangesSchema)) input: SubmitReleaseChangesDto,
  ) {
    return this.changes.submit(artist.id, id, input, cover)
  }

  @WithdrawReleaseChangesSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(HttpStatus.OK)
  @Post(':id/changes/:requestId/withdraw')
  withdraw(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('requestId', ParseUUIDPipe) requestId: string,
  ) {
    return this.changes.withdraw(artist.id, id, requestId)
  }
}
