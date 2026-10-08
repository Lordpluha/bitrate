import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { UpdateReleaseContributorDto } from '../dtos/update-release-contributor.dto'
import { ReleaseContributorEntity } from '../entities/release-contributor.entity'

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
