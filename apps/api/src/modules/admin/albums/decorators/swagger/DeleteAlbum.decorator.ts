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

/** Runs the delete album swagger operation. */
export function DeleteAlbumSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminAlbumEntity),
    ApiOperation({
      summary: 'Soft-delete (take down) an album',
      description: "The album's tracks are not affected and stay independently manageable.",
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiBody({ type: TakeDownReasonDto, required: false }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminAlbumEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Album not found' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Album is already deleted' }),
  )
}
