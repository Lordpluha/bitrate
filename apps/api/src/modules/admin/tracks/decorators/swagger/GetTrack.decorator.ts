import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { AdminTrackDetailEntity } from '../../entities'

/** Runs the get track swagger operation. */
export function GetTrackSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminTrackDetailEntity),
    ApiOperation({ summary: 'Get a track by id, including renditions, credits, and reports' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminTrackDetailEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Track not found' }),
  )
}
