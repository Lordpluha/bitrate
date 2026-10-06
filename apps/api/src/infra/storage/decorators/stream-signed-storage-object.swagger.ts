import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

/** Swagger metadata for the signed storage object stream endpoint. */
export const StreamSignedStorageObjectSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Stream a storage object via a signed, time-limited token',
      description:
        'Time-limited URL issued by the storage service; the API streams the object through STORAGE_SERVICE. The token embeds the object key and expiry, verified via HMAC.',
    }),
    ApiParam({ name: 'token', type: 'string' }),
    ApiResponse({ status: 200, description: 'Full object stream' }),
    ApiResponse({ status: 206, description: 'Partial content for a Range request' }),
    ApiResponse({ status: 404, description: 'Signed URL invalid, expired, or object not found' }),
  )
