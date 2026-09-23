import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'

/** Get a short-lived direct URL for a private cover or profile image. */
export function GetImagePresignedUrlSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get a presigned URL for a cover or profile image',
      description:
        '`key` must match a cover (`tracks|albums|playlists/<id>/cover.<ext>`) or profile image ' +
        '(`artists|users/<id>/(avatar|background).<ext>`) storage key. The URL expires after 900 seconds.',
    }),
    ApiQuery({ name: 'key', required: true, type: String, description: 'The storage object key' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'The presigned URL and its expiry in seconds',
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Unsupported image storage key' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Image not found' }),
  )
}
