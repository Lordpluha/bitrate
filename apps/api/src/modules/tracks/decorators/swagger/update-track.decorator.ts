import { UpdateTrackDto } from '@modules/tracks/dtos/create-track.dto'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

/** Runs the update track by id swagger operation. */
export function UpdateTrackByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Direct artist catalogue edits are disabled',
      description:
        'Catalogue audio and metadata cannot be changed through this legacy endpoint. Upload audio to a release draft and submit it for review. Authenticated requests always return 403 without processing uploaded files.',
      deprecated: true,
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Track ID' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: UpdateTrackDto, required: true }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Use the reviewed release workflow',
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated as artist' }),
  )
}
