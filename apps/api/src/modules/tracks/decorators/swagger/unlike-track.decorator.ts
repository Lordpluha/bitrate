import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { TrackEntity } from '../../entities'

/** Runs the unlike track swagger operation. */
export function UnlikeTrackSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Unlike a track' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Track ID' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Track unliked', type: TrackEntity }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
  )
}
