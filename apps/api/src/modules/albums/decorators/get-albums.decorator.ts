import { paginatedResponseSchema } from '@common/swagger'
import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { AlbumEntity } from '../entities'

/** Runs the get albums swagger operation. */
export function GetAlbumsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all albums with pagination and filters' }),
    ApiQuery({ name: 'page', required: false, type: Number, minimum: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, minimum: 1, maximum: 100 }),
    ApiQuery({ name: 'title', required: false, type: String }),
    ApiQuery({
      name: 'artistId',
      required: false,
      type: String,
      format: 'uuid',
      description: 'Return albums belonging to this artist',
    }),
    ApiResponse({
      status: 200,
      schema: paginatedResponseSchema(AlbumEntity),
    }),
  )
}
