import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import {
  ProfileImageVersionDto,
  SetArtistLocaleDto,
  UpdateArtistProfileDto,
} from '../dtos/artist-profile.dto'
import { ArtistProfileEntity } from '../entities/artist-profile.entity'

const kindParam = ApiParam({ name: 'kind', enum: ['avatar', 'background'] })
const versionConflict = ApiResponse({
  status: HttpStatus.CONFLICT,
  description: 'Profile changed since it was read, or the handle is taken',
})

export function ReadArtistProfileSwagger() {
  return applyDecorators(
    ApiOperation({ summary: "Read the signed-in artist's profile and account summary" }),
    ApiResponse({ status: HttpStatus.OK, type: ArtistProfileEntity }),
  )
}

export function UpdateArtistProfileSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Edit the public profile',
      description: 'Handle, bio, country and links. A null link removes it.',
    }),
    ApiBody({ type: UpdateArtistProfileDto }),
    ApiResponse({ status: HttpStatus.OK, type: ArtistProfileEntity }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid fields or links' }),
    versionConflict,
  )
}

export function SetArtistLocaleSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Set the workspace language',
      description:
        'A preference, not profile content: no version is required and the profile version is left unchanged.',
    }),
    ApiBody({ type: SetArtistLocaleDto }),
    ApiResponse({ status: HttpStatus.OK, type: ArtistProfileEntity }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Unsupported language' }),
  )
}

export function UploadProfileImageSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Upload the avatar or the profile background',
      description: 'JPEG, PNG or WebP up to 10 MB, checked against its content.',
    }),
    kindParam,
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['image', 'expectedUpdatedAt'],
        properties: {
          image: { type: 'string', format: 'binary' },
          expectedUpdatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({ status: HttpStatus.OK, type: ArtistProfileEntity }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Missing, oversized or invalid image',
    }),
    versionConflict,
  )
}

export function RemoveProfileImageSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove the avatar or the profile background' }),
    kindParam,
    ApiBody({ type: ProfileImageVersionDto }),
    ApiResponse({ status: HttpStatus.OK, type: ArtistProfileEntity }),
    versionConflict,
  )
}
