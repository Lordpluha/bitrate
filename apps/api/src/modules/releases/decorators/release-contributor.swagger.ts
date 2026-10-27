import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { ReleaseDraftVersionDto } from '../dtos/release-media.dto'
import { UpdateReleaseContributorDto } from '../dtos/update-release-contributor.dto'
import { ReleaseContributorEntity } from '../entities/release-contributor.entity'
import { ReleaseContributorRemovedEntity } from '../entities/release-contributor-removed.entity'

const detailResponses = () =>
  applyDecorators(
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiParam({ name: 'contributorId', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, type: ReleaseContributorEntity }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Release or credit unavailable to this artist',
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid fields or ID' }),
  )

export function ReleaseContributorSwagger() {
  return applyDecorators(
    detailResponses(),
    ApiOperation({
      summary: 'Read a credited participant and current release version',
      description:
        'Owned active release only. Includes credits with no roles so they can be corrected; never exposes account links or splits.',
    }),
  )
}

export function UpdateReleaseContributorSwagger() {
  return applyDecorators(
    detailResponses(),
    ApiOperation({
      summary: 'Edit a credited participant in an owned draft',
      description:
        'Provide name, unique roles and expectedUpdatedAt. The release version and selected credit are changed in one transaction. Credit identity, artist link and splits are preserved.',
    }),
    ApiBody({ type: UpdateReleaseContributorDto }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Release changed or is no longer a draft',
    }),
  )
}

export function CreditReleaseArtistSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Credit the artist alone on an owned draft without credits',
      description:
        'Adds the artist as performer, composer and lyricist with 100% of the master and publishing splits, as a new draft starts. Clears both rights confirmations. Refused once the draft credits anyone, so divided shares are never overwritten.',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiBody({ type: ReleaseDraftVersionDto }),
    ApiResponse({ status: HttpStatus.CREATED, type: ReleaseContributorEntity }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid version or release ID' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Release unavailable to this artist',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Release changed, is no longer a draft or already credits someone',
    }),
  )
}

export function RemoveReleaseContributorSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Remove a credited participant from an owned draft',
      description:
        'Deletes the credit together with its shares; its tasks become unassigned. Clears both rights confirmations.',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiParam({ name: 'contributorId', format: 'uuid' }),
    ApiBody({ type: ReleaseDraftVersionDto }),
    ApiResponse({ status: HttpStatus.OK, type: ReleaseContributorRemovedEntity }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid version or ID' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Release or credit unavailable to this artist',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Release changed or is no longer a draft',
    }),
  )
}
