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
import { AdminArtistEntity } from '../../entities'

/** Runs the restore artist swagger operation. */
export function RestoreArtistSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminArtistEntity),
    ApiOperation({ summary: 'Restore a previously deactivated artist' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiBody({ type: TakeDownReasonDto, required: false }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminArtistEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Artist not found' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Artist is not deleted' }),
  )
}
