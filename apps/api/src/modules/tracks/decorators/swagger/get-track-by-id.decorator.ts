import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { TrackEntity } from '../../entities'

/** Runs the get track by id swagger operation. */
export function GetTrackByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get track by id' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Track ID' }),
    ApiResponse({
      status: HttpStatus.OK,
      type: TrackEntity,
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Track not found' }),
  )
}
