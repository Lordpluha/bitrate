import { paginatedResponseSchema } from '@common/swagger'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiConsumes, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { SafeArtistEntity } from '../../entities'

/** Runs the get artists swagger operation. */
export function GetArtistsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all artists with pagination' }),
    ApiQuery({
      name: 'username',
      required: false,
      type: String,
      description: 'Search by artist username',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
      description: 'Page number',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 10,
      description: 'Items per page',
    }),
    ApiConsumes('application/json'),
    ApiResponse({
      status: HttpStatus.OK,
      schema: paginatedResponseSchema(SafeArtistEntity),
    }),
  )
}
