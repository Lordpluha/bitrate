import { paginatedResponseSchema } from '@common/swagger'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiConsumes, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { TrackEntity } from '../../entities'

/** Runs the tracks get all swagger operation. */
export function TracksGetAllSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all tracks with pagination' }),
    ApiQuery({
      name: 'title',
      required: false,
      type: String,
      description: 'Search by track title',
    }),
    ApiQuery({
      name: 'artistId',
      required: false,
      type: String,
      format: 'uuid',
      description: 'Return tracks belonging to this artist',
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
      schema: paginatedResponseSchema(TrackEntity),
    }),
  )
}
