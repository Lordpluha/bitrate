import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import type { ArtistAuthRequest } from '@modules/artists-auth/types'
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseEnumPipe,
  Patch,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags } from '@nestjs/swagger'
import { memoryStorage } from 'multer'
import { ZodValidationPipe } from 'nestjs-zod'
import { ARTIST_PROFILE_ERRORS } from './artist-profile.errors'
import { ArtistProfileService, type ProfileImageKind } from './artist-profile.service'
import {
  ReadArtistProfileSwagger,
  RemoveProfileImageSwagger,
  SetArtistLocaleSwagger,
  UpdateArtistProfileSwagger,
  UploadProfileImageSwagger,
} from './decorators'
import {
  type ProfileImageVersionDto,
  ProfileImageVersionSchema,
  type SetArtistLocaleDto,
  SetArtistLocaleSchema,
  type UpdateArtistProfileDto,
  UpdateArtistProfileSchema,
} from './dtos/artist-profile.dto'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const IMAGE_KINDS = { avatar: 'avatar', background: 'background' } as const

/** The signed-in artist's own profile; the public artist routes stay read-oriented. */
@ApiTags('Artist profile')
@Controller({ path: 'artist-profile', version: '1' })
export class ArtistProfileController {
  constructor(private readonly profile: ArtistProfileService) {}

  @ReadArtistProfileSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get()
  read(@Req() request: ArtistAuthRequest) {
    return this.profile.read(request.artist.id)
  }

  @UpdateArtistProfileSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Patch()
  update(
    @Req() request: ArtistAuthRequest,
    @Body(new ZodValidationPipe(UpdateArtistProfileSchema)) input: UpdateArtistProfileDto,
  ) {
    return this.profile.update(request.artist.id, input)
  }

  // Declared before `:kind` so `locale` is never read as an image kind.
  @SetArtistLocaleSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Put('locale')
  setLocale(
    @Req() request: ArtistAuthRequest,
    @Body(new ZodValidationPipe(SetArtistLocaleSchema)) input: SetArtistLocaleDto,
  ) {
    return this.profile.setLocale(request.artist.id, input.locale)
  }

  @UploadProfileImageSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 10 * 1024 * 1024, files: 1 },
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        if (!IMAGE_TYPES.includes(file.mimetype)) {
          return cb(new BadRequestException(ARTIST_PROFILE_ERRORS.IMAGE_REQUIRED), false)
        }
        cb(null, true)
      },
    }),
  )
  @Put(':kind')
  uploadImage(
    @Req() request: ArtistAuthRequest,
    @Param('kind', new ParseEnumPipe(IMAGE_KINDS)) kind: ProfileImageKind,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body(new ZodValidationPipe(ProfileImageVersionSchema)) input: ProfileImageVersionDto,
  ) {
    return this.profile.uploadImage(request.artist.id, kind, file, input)
  }

  @RemoveProfileImageSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Delete(':kind')
  removeImage(
    @Req() request: ArtistAuthRequest,
    @Param('kind', new ParseEnumPipe(IMAGE_KINDS)) kind: ProfileImageKind,
    @Body(new ZodValidationPipe(ProfileImageVersionSchema)) input: ProfileImageVersionDto,
  ) {
    return this.profile.removeImage(request.artist.id, kind, input)
  }
}
