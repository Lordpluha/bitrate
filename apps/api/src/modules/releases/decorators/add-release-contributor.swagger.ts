import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { AddReleaseContributorDto } from '../dtos/add-release-contributor.dto'
import { ReleaseContributorAddedEntity } from '../entities/release-contributor-added.entity'

export function AddReleaseContributorSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Add a credited participant to an owned draft',
      description:
        'Requires the release updatedAt version and at least one unique role. The credit grants no account access and does not set rights or splits. A rejected write changes neither release nor credits.',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiBody({ type: AddReleaseContributorDto }),
    ApiResponse({ status: HttpStatus.CREATED, type: ReleaseContributorAddedEntity }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid name, roles or release ID',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Release unavailable to this artist',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Release changed or is no longer a draft',
    }),
    ApiResponse({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      description: 'The release already credits the maximum of 50 contributors',
    }),
  )
}
