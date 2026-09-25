import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { AdminTrackEntity } from '../../entities'

/** Runs the reprocess track swagger operation. */
export function ReprocessTrackSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminTrackEntity),
    ApiOperation({ summary: "Re-queue a track's stored source file for transcoding" }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminTrackEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Track not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Requires the ADMIN role' }),
  )
}
