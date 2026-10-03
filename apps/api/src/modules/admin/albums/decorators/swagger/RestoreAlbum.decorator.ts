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
import { AdminAlbumEntity } from '../../entities'

/** Runs the restore album swagger operation. */
export function RestoreAlbumSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminAlbumEntity),
    ApiOperation({ summary: 'Restore a previously taken-down album' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiBody({ type: TakeDownReasonDto, required: false }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminAlbumEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Album not found' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Album is not deleted' }),
  )
}
