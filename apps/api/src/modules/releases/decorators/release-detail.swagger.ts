import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { ReleaseEntity } from '../entities/release.entity'

export function ReleaseDetailSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Read an owned active release workspace' }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, type: ReleaseEntity }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid release ID' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Release unavailable to this artist',
    }),
  )
}
