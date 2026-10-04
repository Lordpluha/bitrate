import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { SetPlaylistVisibilityDto } from '../../dtos'
import { AdminPlaylistEntity } from '../../entities'

/** Runs the set playlist visibility swagger operation. */
export function SetPlaylistVisibilitySwagger() {
  return applyDecorators(
    ApiExtraModels(AdminPlaylistEntity),
    ApiOperation({
      summary: 'Hide a playlist (force private) or un-hide one an operator hid',
      description:
        '`isPublic: false` hides; `isPublic: true` un-hides. Neither changes the take-down ' +
        'state. A private playlist with no operator hide on record cannot be un-hidden.',
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiBody({ type: SetPlaylistVisibilityDto }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminPlaylistEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Playlist not found' }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description:
        'Already in the requested visibility, or an un-hide of a playlist no operator hid',
    }),
  )
}
