import { AdminRevokeSessionsResultEntity, TakeDownReasonDto } from '@modules/admin/shared'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger'

/** Runs the revoke artist sessions swagger operation. */
export function RevokeArtistSessionsSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminRevokeSessionsResultEntity),
    ApiOperation({
      summary: 'Revoke every active session for an artist — signs them out on next refresh',
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiBody({ type: TakeDownReasonDto, required: false }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: { $ref: getSchemaPath(AdminRevokeSessionsResultEntity) },
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Artist not found' }),
  )
}
