import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { AdminTrackEntity } from '../../entities'

/** Runs the get track swagger operation. */
export function GetTrackSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminTrackEntity),
    ApiOperation({ summary: 'Get a track by id' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminTrackEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Track not found' }),
  )
}
