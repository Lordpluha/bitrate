import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AlbumEntity } from '../entities'

/** Runs the create album swagger operation. */
export function CreateAlbumSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new album' }),
    ApiResponse({
      status: HttpStatus.OK,
      type: AlbumEntity,
    }),
  )
}
