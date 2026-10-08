import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { ReleaseWorkspaceEntity } from '../entities/release-workspace.entity'

export function ReleaseWorkspaceSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Read an owned release with its schedule, tracks and participants' }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, type: ReleaseWorkspaceEntity }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid release ID' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Release unavailable to this artist',
    }),
  )
}
