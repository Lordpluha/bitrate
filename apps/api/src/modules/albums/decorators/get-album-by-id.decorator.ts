import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AlbumEntity } from '../entities'

/** Runs the get album by id swagger operation. */
export function GetAlbumByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get album by id' }),
    ApiResponse({
      status: HttpStatus.OK,
      type: AlbumEntity,
    }),
  )
}
