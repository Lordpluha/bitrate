import { CreateTrackDto } from '@modules/tracks/dtos/create-track.dto'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { TrackEntity } from '../../entities'

/** Runs the update track by id swagger operation. */
export function UpdateTrackByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update track by id' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Track ID' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: CreateTrackDto, required: true }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Track updated',
      type: TrackEntity,
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated as artist' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Track not found' }),
  )
}
