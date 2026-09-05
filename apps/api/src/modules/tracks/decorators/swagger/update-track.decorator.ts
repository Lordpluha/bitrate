import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiConsumes, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

/** Runs the update track by id swagger operation. */
export function UpdateTrackByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update track by id' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Track ID' }),
    ApiConsumes('multipart/form-data'),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Track updated',
      schema: { $ref: '#/components/schemas/TrackEntity' },
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated as artist' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Track not found' }),
  )
}
