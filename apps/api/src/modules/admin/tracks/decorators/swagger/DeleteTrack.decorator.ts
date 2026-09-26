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

/** Runs the delete track swagger operation. */
export function DeleteTrackSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminTrackEntity),
    ApiOperation({ summary: 'Soft-delete (take down) a track' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiBody({ type: TakeDownReasonDto, required: false }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminTrackEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Track not found' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Track is already deleted' }),
  )
}
