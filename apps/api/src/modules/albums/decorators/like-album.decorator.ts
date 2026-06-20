import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

export function LikeAlbumSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Like an album' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Album ID' }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'Album liked' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Album not found' }),
  )
}
