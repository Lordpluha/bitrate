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
import { AdminPlaylistEntity } from '../../entities'

/** Runs the delete playlist swagger operation. */
export function DeletePlaylistSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminPlaylistEntity),
    ApiOperation({
      summary: 'Soft-delete (take down) a playlist',
      description: "The harder tier: stamps `deletedAt`. The playlist's visibility is untouched.",
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiBody({ type: TakeDownReasonDto, required: false }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminPlaylistEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Playlist not found' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Playlist is already deleted' }),
  )
}
