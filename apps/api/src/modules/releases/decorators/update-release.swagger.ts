import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { UpdateReleaseDto } from '../dtos/update-release.dto'
import { ReleaseEntity } from '../entities/release.entity'

export function UpdateReleaseSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Edit an owned release draft',
      description:
        'Updates title, type and/or planned schedule only in DRAFT status. Requires the previously read updatedAt version; concurrent changes return 409. Saving a schedule does not submit or deliver a release.',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiBody({ type: UpdateReleaseDto }),
    ApiResponse({ status: HttpStatus.OK, type: ReleaseEntity }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid draft fields or release ID',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Release unavailable to this artist',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Release changed since it was read or is no longer a draft',
    }),
  )
}
