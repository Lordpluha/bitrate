import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

export function UpdateAlbumByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update album by id' }),
    ApiResponse({
      schema: {
        $ref: '#/components/schemas/AlbumEntity',
      },
    }),
  )
}
