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

/** Runs the restore playlist swagger operation. */
export function RestorePlaylistSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminPlaylistEntity),
    ApiOperation({
      summary: 'Restore a previously taken-down playlist',
      description: 'Clears `deletedAt` only; a hidden playlist stays hidden.',
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiBody({ type: TakeDownReasonDto, required: false }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminPlaylistEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Playlist not found' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Playlist is not deleted' }),
  )
}
