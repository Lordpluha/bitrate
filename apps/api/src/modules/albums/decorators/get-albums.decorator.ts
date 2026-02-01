import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

export function GetAlbumsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all albums with pagination and filters' }),
    ApiResponse({
      schema: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/AlbumEntity',
        },
      },
    }),
  )
}
