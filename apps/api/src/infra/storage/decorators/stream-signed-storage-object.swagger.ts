import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

/** Swagger metadata for the signed local-storage object stream endpoint. */
export const StreamSignedStorageObjectSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Stream a local storage object via a signed, time-limited token',
      description:
        'Local-driver equivalent of an S3 presigned URL. The token embeds the object key and expiry, verified via HMAC.',
    }),
    ApiParam({ name: 'token', type: 'string' }),
    ApiResponse({ status: 200, description: 'Full object stream' }),
    ApiResponse({ status: 206, description: 'Partial content for a Range request' }),
    ApiResponse({ status: 404, description: 'Signed URL invalid, expired, or object not found' }),
  )
