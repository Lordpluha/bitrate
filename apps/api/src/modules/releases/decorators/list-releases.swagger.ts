import { MAX_LIMIT } from '@common/pagination'
import { paginatedResponseSchema } from '@common/swagger'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { ReleaseEntity } from '../entities/release.entity'

export function ListReleasesSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'List the authenticated artist’s release workspaces' }),
    ApiQuery({ name: 'page', required: false, schema: { type: 'integer', minimum: 1 } }),
    ApiQuery({
      name: 'limit',
      required: false,
      schema: { type: 'integer', minimum: 1, maximum: MAX_LIMIT },
    }),
    ApiResponse({ status: HttpStatus.OK, schema: paginatedResponseSchema(ReleaseEntity) }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid pagination' }),
  )
}
