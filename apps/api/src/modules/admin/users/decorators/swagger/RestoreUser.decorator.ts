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
import { AdminUserEntity } from '../../entities'

/** Runs the restore user swagger operation. */
export function RestoreUserSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminUserEntity),
    ApiOperation({ summary: 'Restore a previously deactivated user' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiBody({ type: TakeDownReasonDto, required: false }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminUserEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'User is not deleted' }),
  )
}
