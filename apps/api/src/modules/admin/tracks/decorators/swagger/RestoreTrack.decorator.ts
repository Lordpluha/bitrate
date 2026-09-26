import { TakeDownReasonDto } from '@modules/admin/shared'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { AdminTrackEntity } from '../../entities'

/** Runs the restore track swagger operation. */
export function RestoreTrackSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminTrackEntity),
    ApiOperation({ summary: 'Restore a previously taken-down track' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiBody({ type: TakeDownReasonDto, required: false }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminTrackEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Track not found' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Track is not deleted' }),
  )
}
