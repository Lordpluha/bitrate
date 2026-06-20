import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

export function GetTrackByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get track by id' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Track ID' }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: { $ref: '#/components/schemas/TrackEntity' },
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Track not found' }),
  )
}
