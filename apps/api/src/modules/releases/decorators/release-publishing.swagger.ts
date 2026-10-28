import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { ReleaseDraftVersionDto } from '../dtos/release-media.dto'
import { ReleaseEntity } from '../entities/release.entity'

const versionedWrite = (conflict: string) => [
  ApiParam({ name: 'id', format: 'uuid' }),
  ApiBody({ type: ReleaseDraftVersionDto }),
  ApiResponse({ status: HttpStatus.OK, type: ReleaseEntity }),
  ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Missing version or invalid release ID',
  }),
  ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Release unavailable to this artist' }),
  ApiResponse({ status: HttpStatus.CONFLICT, description: conflict }),
]

export function CancelPremiereSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cancel a scheduled premiere',
      description:
        'SCHEDULED -> READY. The release stays approved and its timing becomes editable again; publish again to go live.',
    }),
    ...versionedWrite('Release changed since it was read or has no scheduled premiere'),
  )
}

export function UnpublishReleaseSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Take a live release offline',
      description:
        'RELEASED -> UNPUBLISHED. Its tracks stop playing everywhere, including playlists, likes and history; the album page becomes unavailable. Publish it again at any time.',
    }),
    ...versionedWrite('Release changed since it was read or is not live on Bitrate'),
  )
}

export function RepublishReleaseSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Publish an offline release again',
      description:
        'UNPUBLISHED -> RELEASED without a new review and without notifying followers again. A release Bitrate took down cannot be republished by the artist.',
    }),
    ...versionedWrite('Release changed since it was read or cannot be published again'),
  )
}

export function PublishReleaseSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Publish an approved release on Bitrate',
      description:
        'Moves READY to PUBLISHING and converts every recording for the Bitrate player. Nothing is visible to listeners until every track converted; the release then becomes RELEASED, its album appears and followers are notified once. A conversion that fails for good makes the release PUBLISH_FAILED until Bitrate retries it. External stores are not involved. Requires the previously read updatedAt version.',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiBody({ type: ReleaseDraftVersionDto }),
    ApiResponse({ status: HttpStatus.OK, type: ReleaseEntity }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Missing version or invalid release ID',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Release unavailable to this artist',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Release changed since it was read or is not approved for publishing',
    }),
  )
}
