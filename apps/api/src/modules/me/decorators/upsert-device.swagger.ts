import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { UpsertDeviceDto } from '../dtos'

/** Register a new playback device, or update one the caller already owns. */
export function UpsertDeviceSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Register or update a playback device',
      description:
        'With `id` set, updates a device the caller owns. Without `id`, creates a new one. Setting `isActive` deactivates every other device for the caller.',
    }),
    ApiBody({ type: UpsertDeviceDto }),
    ApiResponse({ status: HttpStatus.OK, description: 'The created or updated device' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Device id does not belong to the caller',
    }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Device is already active' }),
  )
}
