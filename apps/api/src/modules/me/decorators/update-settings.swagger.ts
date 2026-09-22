import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { UpdateSettingsDto } from '../dtos'

/** Patch one or more of the caller's settings fields, upserting the row on first write. */
export function UpdateSettingsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "Update the caller's settings",
      description: 'Every field is optional; only the fields present in the body are changed.',
    }),
    ApiBody({ type: UpdateSettingsDto }),
    ApiResponse({ status: HttpStatus.OK, description: 'The updated settings row' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error' }),
  )
}
