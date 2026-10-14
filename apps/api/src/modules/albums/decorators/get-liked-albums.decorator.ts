import { paginatedResponseSchema } from '@common/swagger'
import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { AlbumEntity } from '../entities'

/** Swagger for the signed-in user's saved albums. */
export function GetLikedAlbumsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: "Get the signed-in user's saved albums, newest like first" }),
    ApiQuery({ name: 'page', required: false, type: Number, minimum: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, minimum: 1, maximum: 100 }),
    ApiResponse({ status: 200, schema: paginatedResponseSchema(AlbumEntity) }),
  )
}
