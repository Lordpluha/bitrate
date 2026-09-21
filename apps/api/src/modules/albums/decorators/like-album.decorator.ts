import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { AlbumEntity } from '../entities'

/** Runs the like album swagger operation. */
export function LikeAlbumSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Like an album' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Album ID' }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'Album liked', type: AlbumEntity }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Album not found' }),
  )
}
