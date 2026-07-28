import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

/** Runs the get album by id swagger operation. */
export function GetAlbumByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get album by id' }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: {
        $ref: '#/components/schemas/AlbumEntity',
      },
    }),
  )
}
