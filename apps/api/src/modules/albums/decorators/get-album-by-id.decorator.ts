import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

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
